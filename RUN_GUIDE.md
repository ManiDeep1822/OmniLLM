# OmniLLM Run Guide 🚀

OmniLLM is a headless MCP Gateway. Follow these steps to run the server and connect it to your AI agent.

## 1. Setup Environment
Ensure your API keys are configured in the `.env` file at the root of the project.
```bash
GEMINI_API_KEY=your_key_here
CLAUDE_API_KEY=your_key_here
OPENAI_API_KEY=your_key_here
```

## 2. Start the MCP Server
Run the following command from the root directory:
```bash
npm run dev
```
This starts the TypeScript server in watch mode using `tsx`. The server will listen for MCP JSON-RPC commands over standard input/output.

## 3. Connect to an MCP Client (Antigravity/Claude Desktop)
To use OmniLLM in your IDE or desktop client, add it to your `mcp_config.json`:

**Windows Path**: `C:\Users\<YourUser>\.gemini\antigravity\mcp_config.json`

```json
{
  "mcpServers": {
    "llm-gateway": {
      "command": "node",
      "args": ["C:/absolute/path/to/OmniLLM/dist/server.js"],
      "env": {
        "GEMINI_API_KEY": "YOUR_KEY_HERE"
      }
    }
  }
}
```

## 4. Production Build
For production use, it is recommended to build the project first:
```bash
npm run build
npm start
```

## 📊 Monitoring
As a headless gateway, OmniLLM logs all activity to `STDERR` to avoid interfering with the MCP protocol. You can monitor these logs in your terminal or check the persistent history in the SQLite database via Prisma:
```bash
npx prisma studio
```
