import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import { config } from './config.js';
import { tools } from './tools/index.js';
import { initSocket, getIO } from './dashboard/socket.js';
import { getHistory, prisma } from './db/logger.js';
import { writeFileSync } from 'fs';

const mcpServer = new McpServer({
  name: 'llm-gateway',
  version: '1.0.0',
});

for (const tool of tools) {
  mcpServer.tool(
    tool.name,
    tool.description,
    tool.schema instanceof Function ? {} : (tool.schema as any),
    tool.handler as any
  );
}

const app = express();
app.use(cors());
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

app.post('/api/test-stream', async (req, res) => {
  // Simulate a real-time streaming LLM response
  const providers = ['Anthropic', 'OpenAI', 'Google'];
  const provider = providers[Math.floor(Math.random() * providers.length)];
  const models: Record<string, string> = { 'Anthropic': 'claude-3-5-sonnet', 'OpenAI': 'gpt-4o', 'Google': 'gemini-1.5-pro' };
  
  const text = "This is a simulated real-time stream. The Auto-Router has dynamically selected the optimal provider for this request. Neural networks are processing the tokens and returning them through the WebSocket connection to your dashboard. This proves the pipeline is fully operational!";
  const words = text.split(' ');
  
  res.status(200).json({ status: 'streaming_started' });
  
  for (let i = 0; i < words.length; i++) {
    await new Promise(r => setTimeout(r, 60 + Math.random() * 40));
    const { emitToDashboard } = await import('./dashboard/socket.js');
    emitToDashboard('token', {
      provider: provider,
      model: models[provider],
      text: words[i] + ' ',
      timestamp: new Date().toISOString()
    });
  }
  
  await new Promise(r => setTimeout(r, 100));
  const { emitToDashboard } = await import('./dashboard/socket.js');
  
  emitToDashboard('stream_complete', {
    provider: provider,
    model: models[provider],
    tokenCount: words.length + 5,
    latencyMs: words.length * 80 + 200,
    timestamp: new Date().toISOString()
  });

  // Log mock to DB so it shows up in history too
  try {
    const { logCall } = await import('./db/logger.js');
    await logCall({
      modelProvider: provider,
      modelName: models[provider],
      prompt: "Simulate a live stream",
      response: text,
      tokenCount: words.length + 5,
      costEstimate: 0.0012,
      latencyMs: words.length * 80 + 200,
      isStreamed: true,
      status: 'success'
    });
  } catch (e) {
    console.error("Failed to log mock stream:", e);
  }
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

      let status = 'healthy';
      if (lastCalls.length > 0) {
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
initSocket(httpServer);

async function findFreePort(startPort: number): Promise<number> {
  return new Promise((resolve) => {
    const server = createServer();
    server.listen(startPort, () => {
      const port = (server.address() as any).port;
      server.close(() => resolve(port));
    });
    server.on('error', () => resolve(findFreePort(startPort + 1)));
  });
}

const start = async () => {
  try {
    const actualPort = await findFreePort(3000);
    
    // Explicitly write the discovered port
    writeFileSync('.dashboard-port', String(actualPort));
    console.error(`Dashboard running on port ${actualPort}`);

    await new Promise((resolve) => {
      httpServer.listen(actualPort, '0.0.0.0', () => {
        resolve(true);
      });
    });

    // Always start the MCP transport
    const transport = new StdioServerTransport();
    mcpServer.connect(transport).catch(err => {
      console.error('MCP connection error:', err);
    });
  } catch (error) {
    console.error('Critical failure during startup:', error);
    process.exit(1);
  }
};

start();

