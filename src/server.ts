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
