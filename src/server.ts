import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import { config } from './config.js';
import { tools } from './tools/index.js';
import { initSocket, getIO } from './dashboard/socket.js';
import { getHistory, prisma } from './db/logger.js';
import { getAvailableProviders } from './providers/index.js';
import { getActiveModel, setActiveModel } from './config.js';
import { writeFileSync, existsSync, unlinkSync } from 'fs';

console.error('[v1.1.0] LLM Gateway starting...');
process.on('uncaughtException', (err) => {
  console.error('[v1.1.0] CRITICAL: UNCAUGHT EXCEPTION:', err);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('[v1.1.0] CRITICAL: UNHANDLED REJECTION at:', promise, 'reason:', reason);
});
try {
  if (existsSync('.dashboard-port')) unlinkSync('.dashboard-port');
} catch (e) {
  // Ignore
}

process.on('SIGTERM', () => process.exit(0));
process.on('SIGINT', () => process.exit(0));

const mcpServer = new McpServer({
  name: 'llm-gateway',
  version: '1.0.0',
});

// Register tools
for (const tool of tools) {
  mcpServer.tool(
    tool.name,
    tool.description,
    tool.schema instanceof Function ? {} : (tool.schema as any),
    tool.handler as any
  );
}

const app = express();
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174'
  ],
  credentials: true
}));
app.use(express.json());



app.get('/api/history', async (req, res) => {

  try {
    const history = await getHistory(50);
    res.json(history);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/config', (req, res) => {
  const keys = [
    { key: 'GEMINI_API_KEY', label: 'Google Gemini', set: !!(config.GEMINI_API_KEY && config.GEMINI_API_KEY.trim()) },
    { key: 'CLAUDE_API_KEY', label: 'Anthropic Claude', set: !!(config.CLAUDE_API_KEY && config.CLAUDE_API_KEY.trim()) },
    { key: 'OPENAI_API_KEY', label: 'OpenAI GPT-4o', set: !!(config.OPENAI_API_KEY && config.OPENAI_API_KEY.trim()) },
    { key: 'DATABASE_URL', label: 'Database', set: !!(process.env.DATABASE_URL && process.env.DATABASE_URL.trim()) },
    { key: 'PORT', label: 'Server Port', set: true, value: config.PORT },
  ];
  res.json({ keys  });
});

app.post('/api/test-error', async (req, res) => {
  const { emitToDashboard } = await import('./dashboard/socket.js');
  emitToDashboard('stream_error', {
    provider: 'Google',
    model: 'gemini-1.5-pro',
    error: 'API Key Expired. Please update your .env file.',
    timestamp: new Date().toISOString()
  });
    res.json({ status: 'error_emitted' });
});


app.get('/api/stats', async (req, res) => {
  try {
    const aggregates = await prisma.lLMCall.aggregate({
      _sum: { tokenCount: true, costEstimate: true },
      _avg: { latencyMs: true },
      _count: { _all: true }
    });

    const activeSessions = await prisma.lLMCall.count({
      where: { timestamp: { gte: new Date(Date.now() - 15 * 60 * 1000) } }
    });

    res.json({
      totalTokens: aggregates._sum.tokenCount || 0,
      totalCost: aggregates._sum.costEstimate || 0,
      avgLatency: Math.round(aggregates._avg.latencyMs || 0),
      totalCalls: aggregates._count._all,
      activeSessions
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/providers/health', async (req, res) => {
  try {
    const providers = ['anthropic', 'openai', 'gemini'];
    const healthData = await Promise.all(providers.map(async (p) => {
      const lastCalls = await prisma.lLMCall.findMany({
        where: { modelProvider: { contains: p } },
        take: 10,
        orderBy: { timestamp: 'desc' }
      });

      const successCount = lastCalls.filter(c => c.status === 'success').length;
      const avgLatency = lastCalls.length > 0 
        ? Math.round(lastCalls.reduce((acc, c) => acc + (c.latencyMs || 0), 0) / lastCalls.length)
        : 0;

      const isConfigured = !!(config[(`${p.toUpperCase()}_API_KEY` as keyof typeof config)] as string)?.trim();

      let status = isConfigured ? 'healthy' : 'unconfigured';
      if (isConfigured && lastCalls.length > 0) {
        if (successCount < 7) status = 'unhealthy';
        else if (successCount < 9 || avgLatency > 5000) status = 'degraded';
      }

      return {
        id: p,
        name: p.charAt(0).toUpperCase() + p.slice(1),
        status,
        latency: avgLatency,
        uptime: successCount * 10, // simplified uptime %
        history: lastCalls.map(c => c.latencyMs || 0).reverse()
      };
    }));

    res.json(healthData);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/providers/available', (req, res) => {
  const available = getAvailableProviders();
  res.json({
    available,
    configured: {
      gemini: !!config.GEMINI_API_KEY?.trim(),
      claude: !!config.CLAUDE_API_KEY?.trim(),
      openai: !!config.OPENAI_API_KEY?.trim()
    }
  });
});


app.get('/api/analytics', async (req, res) => {
  try {
    const period = req.query.period as string || 'daily';
    // Simplified: group by last 7 days for now
    const now = new Date();
    const past = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const calls = await prisma.lLMCall.findMany({
      where: { timestamp: { gte: past } },
      orderBy: { timestamp: 'asc' }
    });

    // Group by day
    const grouped = calls.reduce((acc: any, call) => {
      const date = new Date(call.timestamp).toLocaleDateString();
      if (!acc[date]) acc[date] = { date, cost: 0, tokens: 0 };
      acc[date].cost += call.costEstimate || 0;
      acc[date].tokens += call.tokenCount || 0;
      return acc;
    }, {});

    res.json(Object.values(grouped));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/tools/:name', async (req, res) => {
  const toolName = req.params.name;
  const tool = tools.find(t => t.name === toolName);
  
  if (!tool) {
    return res.status(404).json({ error: `Tool ${toolName} not found` });
  }

  try {
    const result = await tool.handler(req.body);
    res.json(result);
  } catch (error: any) {
    console.error(`Error calling tool ${toolName}:`, error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/health', async (req, res) => {
  try {
    const io = getIO();
    const dbStatus = await prisma.$queryRaw`SELECT 1`.then(() => 'up').catch(() => 'down');
    res.json({
      status: 'healthy',
      uptime: Math.floor(process.uptime()),
      sockets: io ? io.engine.clientsCount : 0,
      db: dbStatus,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({ status: 'unhealthy', error: error.message });
  }
});

app.get('/api/port', (req, res) => {
  const address = httpServer.address();
  res.json({ port: address && typeof address !== 'string' ? address.port : 3000 });
});

const httpServer = createServer(app);
// Fix 2 - Set a longer timeout for the HTTP server
httpServer.timeout = 300000; // 5 minutes
httpServer.keepAliveTimeout = 300000;

initSocket(httpServer);

httpServer.on('error', (err: any) => {
  console.error('HTTP Server Error:', err);
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${err.port} is already in use. Please kill the process using it.`);
  }
  process.exit(1);
});

async function findFreePort(startPort: number): Promise<number> {
  return new Promise((resolve) => {
    const server = createServer();
    server.listen(startPort, '127.0.0.1', () => {
      const port = (server.address() as any).port;
      server.close(() => resolve(port));
    });
    server.on('error', () => {
      server.close();
      resolve(findFreePort(startPort + 1));
    });
  });
}


const requestedPort = Number(config.PORT) || 3000;
const actualPort = await findFreePort(requestedPort);

write_sync_safe('.dashboard-port', String(actualPort));
console.error(`[v1.1.0] Gateway API configured on port ${actualPort}`);

function write_sync_safe(path: string, content: string) {
  try {
    writeFileSync(path, content);
  } catch (e) {
    console.error(`[v1.1.0] Failed to write ${path}:`, e);
  }
}



// Start MCP transport
const transport = new StdioServerTransport();
mcpServer.connect(transport).catch(err => {
  console.error('[v1.1.0] MCP connection error:', err);
});

httpServer.listen(actualPort, '127.0.0.1', () => {
  console.error(`[v1.1.0] Gateway API listening on port ${actualPort}`);
});


