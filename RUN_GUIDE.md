# OmniLLM Run Guide 🚀

Follow these steps to run the OmniLLM Gateway and Dashboard on your local machine.

## 1. Setup Environment
Ensure you have your API keys ready in the `.env` file at the root of the project.
```bash
GEMINI_API_KEY=your_key_here
CLAUDE_API_KEY=your_key_here
OPENAI_API_KEY=your_key_here
```

## 2. Start Everything (Recommended)
The easiest way to run the backend and the dashboard together is from the root directory:
```bash
npm run dev:all
```
This will:
- Launch the **Backend Gateway** (defaulting to port 3000).
- Launch the **Vite Dashboard** (port 5173).
- **Auto-Sync**: The dashboard will automatically detect the backend's port, even if it changed due to a conflict.

## 3. Connect to an MCP Client (Antigravity/Claude Desktop)
To use OmniLLM in your IDE or desktop client, add it to your `mcp_config.json`:

**Path**: `C:\Users\<YourUser>\.gemini\antigravity\mcp_config.json`

```json
{
  "mcpServers": {
    "llm-gateway": {
      "command": "node",
      "args": ["C:/absolute/path/to/OmniLLM/dist/server.js"],
      "env": {
        "GEMINI_API_KEY": "YOUR_KEY_HERE",
        "PORT": "3000"
      }
    }
  }
}
```

## 4. Manual / Separate Start
If you prefer to run them in separate terminal windows:

**Terminal 1 (Backend)**:
```bash
npm run build
npm run dev
```

**Terminal 2 (Dashboard)**:
```bash
cd dashboard-ui
npm run dev
```

## 📊 Monitoring
Once running, you can access the dashboard at:
👉 **[http://localhost:5173](http://localhost:5173)**

You should see logs appearing in real-time as you use tools in your IDE.
