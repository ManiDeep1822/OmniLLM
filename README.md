# OmniLLM Gateway 🚀

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green?logo=node.js)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.x-2D3748?logo=prisma)](https://www.prisma.io/)

**The high-performance, headless MCP Gateway powered by Gemma 4 31B — bridging AI agents to the world's most powerful LLMs.**

</div>

---

## 🎯 Overview

**OmniLLM** is a specialized [Model Context Protocol](https://modelcontextprotocol.io/) server designed for autonomous agents (like Google Antigravity). It provides a unified, high-speed interface for **Gemma 4**, **Claude 3.5 Sonnet**, and **GPT-4o**.

By transitioning to a **headless architecture**, OmniLLM achieves near-zero latency by removing UI-related overhead and Socket.IO dependencies, making it the ideal choice for production-grade agentic environments.

> [!IMPORTANT]
> **Headless Operation**: This server operates exclusively as a tool provider. There is no graphical dashboard, ensuring maximum resources are dedicated to token throughput.

---

## 💎 Flagship Model: Gemma 4 31B

OmniLLM is optimized for the **Gemma 4** family. It currently targets **`gemma-4-31b-it`** as its primary engine for the Google Gemini provider, offering state-of-the-art reasoning and instruction-following capabilities directly via MCP tools.

---

## ⚡ Quick Start

### 1. Installation
```bash
git clone https://github.com/ManiDeep1822/OmniLLM.git
cd OmniLLM
npm install
```

### 2. Configuration
Create a `.env` file:
```bash
cp .env.example .env
```
Add your API keys:
- `GEMINI_API_KEY` (Required for Gemma 4)
- `CLAUDE_API_KEY`
- `OPENAI_API_KEY`

### 3. Database & Launch
```bash
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

---

## 🔧 MCP Integration (Antigravity / Claude Desktop)

To use OmniLLM in your agentic environment, update your configuration file (e.g., `mcp_config.json`):

```json
{
  "mcpServers": {
    "llm-gateway": {
      "command": "node",
      "args": ["C:/Users/YOUR_USER/OneDrive/Desktop/MCP/dist/server.js"],
      "env": {
        "GEMINI_API_KEY": "YOUR_GOOGLE_API_KEY",
        "PORT": "4324"
      }
    }
  }
}
```

---

## 🛠️ Available MCP Tools

| Tool | Capability |
| :--- | :--- |
| `stream-generate` | Real-time streaming output from **Gemma 4**, Claude, or OpenAI. |
| `auto-router` | Automatically routes tasks to the most efficient model based on complexity. |
| `multi-step-chain` | Executes complex, sequential prompts where each step informs the next. |
| `model-comparison` | Run a single prompt across all configured providers to compare quality. |
| `context-chain` | Persistent conversation memory system backed by a local SQLite database. |

---

## 🏗️ Architecture

OmniLLM uses a dual-interface approach:
- **Stdio (Primary)**: High-speed binary/text channel for MCP tool communication.
- **HTTP/JSON (Secondary)**: Lightweight health and configuration API on port **4324**.

---

## 🛡️ Health & Monitoring

You can monitor the gateway status at:
`http://localhost:4324/api/health`

---

## 📄 License

This project is licensed under the **MIT License**.

<div align="center">
  <sub>Built with ❤️ by <a href="https://github.com/ManiDeep1822">Indla Mohana Venkata Mani Deep</a></sub>
</div>
