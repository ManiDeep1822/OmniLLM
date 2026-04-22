import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import { config } from './config.js';
import { tools } from './tools/index.js';
import { prisma } from './db/logger.js';
import { getAvailableProviders } from './providers/index.js';
import { getActiveModel } from './config.js';

console.error('[v1.1.0] MCP LLM Gateway starting...');

process.on('uncaughtException', (err) => {
  console.error('[v1.1.0] CRITICAL: UNCAUGHT EXCEPTION:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[v1.1.0] CRITICAL: UNHANDLED REJECTION at:', promise, 'reason:', reason);
});

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
app.use(cors());
app.use(express.json());

app.get('/api/config', (req, res) => {
  const keys = [
    { key: 'GEMINI_API_KEY', label: 'Google Gemini', set: !!(config.GEMINI_API_KEY && config.GEMINI_API_KEY.trim()) },
    { key: 'CLAUDE_API_KEY', label: 'Anthropic Claude', set: !!(config.CLAUDE_API_KEY && config.CLAUDE_API_KEY.trim()) },
    { key: 'OPENAI_API_KEY', label: 'OpenAI GPT-4o', set: !!(config.OPENAI_API_KEY && config.OPENAI_API_KEY.trim()) },
    { key: 'DATABASE_URL', label: 'Database', set: !!(process.env.DATABASE_URL && process.env.DATABASE_URL.trim()) },
    { key: 'PORT', label: 'Server Port', set: true, value: config.PORT },
  ];
  res.json({ keys });
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

app.get('/api/models', (req, res) => {
  res.json({ current: getActiveModel() });
});

app.get('/api/health', async (req, res) => {
  try {
    const dbStatus = await prisma.$queryRaw`SELECT 1`.then(() => 'up').catch(() => 'down');
    res.json({
      status: 'healthy',
      uptime: Math.floor(process.uptime()),
      db: dbStatus,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({ status: 'unhealthy', error: error.message });
  }
});

const httpServer = createServer(app);
httpServer.timeout = 300000;
httpServer.keepAliveTimeout = 300000;

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

// Start MCP transport
const transport = new StdioServerTransport();
mcpServer.connect(transport).catch(err => {
  console.error('[v1.1.0] MCP connection error:', err);
});

httpServer.listen(actualPort, '127.0.0.1', () => {
  console.error(`[v1.1.0] MCP API listening on port ${actualPort}`);
}).on('error', (err: any) => {
  console.error(`[v1.1.0] HTTP Server Error:`, err);
});


