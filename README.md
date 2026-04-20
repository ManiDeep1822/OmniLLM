# OmniLLM Gateway 🚀

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**OmniLLM** is a production-grade MCP (Model Context Protocol) server designed to connect the Google Antigravity IDE (and other MCP-compatible clients) to elite LLM providers like Anthropic, OpenAI, and Google. It features a robust multi-model routing system, persistent context chaining, and a real-time monitoring dashboard.

## 🌟 Features

- ⚡ **Real-time Streaming**: Full support for real-time token streaming to the dashboard and IDE.
- 🚦 **Auto-Router**: Dynamically selects the best model based on task complexity (Claude for reasoning, Gemini for coding).
- ⛓️ **Context Chaining**: Maintains state and memory across multiple turns using a local database.
- 📊 **Monitoring Dashboard**: A Vite-based frontend to visualize live LLM requests and responses.
- 🛠️ **Multi-Step Chains**: Execute complex, sequential reasoning tasks with automated context passing.
- ⚖️ **Model Comparison**: Benchmarking tools to compare responses from different providers simultaneously.

## 🏗️ Architecture

```text
+-----------------------+          +-----------------------+
|                       |          |                       |
|  Google Antigravity   | <------> |    OmniLLM Gateway    |
|         IDE           |   MCP    |      (Node.js)        |
|                       |          |           +-----------+
+-----------------------+          +-----+-----+           |
                                         |     |     +-----+-------+
                                         |     |     |   Database  |
      +----------------------+           |     |     |  (SQLite)   |
      |                      | <---------+     |     +-------------+
      |    Live Dashboard    |      Socket.io  |
      |   (localhost:5173)   |                 |     +-------------+
      +----------------------+                 +---> | API Providers |
                                                     | (Claude/GPT)  |
                                                     +-------------+
```

## 📋 Prerequisites

- **Node.js**: Version 18.0.0 or higher
- **IDE**: Google Antigravity or any client supporting MCP
- **API Keys**: Anthropic, OpenAI, and Google Gemini keys

## ⚙️ Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/ManiDeep1822/OmniLLM.git
   cd OmniLLM
   ```

2. **Install dependencies**:
   ```bash
   npm install
   cd dashboard-ui && npm install && cd ..
   ```

3. **Configure Environment**:
   ```bash
   cp .env.example .env
   # Add your API keys to the .env file
   ```

4. **Initialize Database**:
   ```bash
   npx prisma migrate dev --name init
   ```

5. **Build the project**:
   ```bash
   npm run build
   ```

## 🔧 Antigravity Configuration

Update your `mcp_config.json` (usually located in `.gemini/antigravity/mcp_config.json`) to include the OmniLLM server:

```json
{
  "mcpServers": {
    "llm-gateway": {
      "command": "node",
      "args": ["C:/absolute/path/to/OmniLLM/dist/server.js"],
      "env": {
        "GEMINI_API_KEY": "YOUR_KEY_HERE",
        "CLAUDE_API_KEY": "YOUR_KEY_HERE",
        "OPENAI_API_KEY": "YOUR_KEY_HERE",
        "DATABASE_URL": "file:./prisma/dev.db"
      }
    }
  }
}
```

## 🛠️ Available MCP Tools

- `stream-generate`: Standard text generation with real-time streaming.
- `multi-step-chain`: Executes a sequence of prompts where each output becomes context for the next.
- `auto-router`: Automatically selects the best model based on the task description.
- `model-comparison`: Compares responses from Claude, GPT-4o, and Gemini for the same prompt.
- `context-chain`: Maintains context across multiple turns using database-backed memory.

## 📊 Dashboard

The monitoring dashboard provides a live feed of all transactions through the gateway.
- **URL**: `http://localhost:5173`
- **Dashboard API**: `http://localhost:3000`

Run it with:
```bash
cd dashboard-ui
npm run dev
```

## 🤝 Contributing

We welcome contributions! Please see our [CONTRIBUTING.md](CONTRIBUTING.md) for details on how to get started.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
