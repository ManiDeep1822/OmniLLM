import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import { config } from './config.js';
import { tools } from './tools/index.js';
import { initSocket, getIO } from './dashboard/socket.js';
import { getHistory, prisma } from './db/logger.js';

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

const httpServer = createServer(app);
initSocket(httpServer);

const start = async () => {
  try {
    const port = parseInt(config.PORT);
    httpServer.listen(port, '0.0.0.0', () => {
      console.error(`Dashboard API and Socket.IO server running on port ${port}`);
    });
    httpServer.on('error', (err) => {
      console.error('HTTP Server error:', err);
    });
    const transport = new StdioServerTransport();
    mcpServer.connect(transport).catch(err => {
      console.error('MCP Server connection failed:', err);
    });
    console.error('MCP Server initialized on Stdio');
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

start();
