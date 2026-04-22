/**
 * mcp.ts — Dedicated MCP stdio entry point.
 *
 * This is what Claude / Antigravity spawns via mcp_server_config.json.
 * It speaks JSON-RPC over stdin/stdout (MCP protocol) and has NO HTTP server.
 *
 * The HTTP dashboard (server.ts) is a separate process started by `npm run dev:all`.
 */
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { tools } from './tools/index.js';

const mcpServer = new McpServer({
  name: 'llm-gateway',
  version: '1.0.0',
});

// Register every tool with the MCP server
for (const tool of tools) {
  mcpServer.tool(
    tool.name,
    tool.description,
    tool.schema instanceof Function ? {} : (tool.schema as any),
    tool.handler as any
  );
}

// Connect to the stdio transport — this is the MCP handshake Claude expects
const transport = new StdioServerTransport();

mcpServer.connect(transport).catch((err) => {
  process.stderr.write(`[mcp] Fatal connection error: ${err.message}\n`);
  process.exit(1);
});
