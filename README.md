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

**OmniLLM** is a specialized [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) server designed for autonomous AI agents. It provides a unified, high-speed interface for **Gemma 4**, **Claude 3.5 Sonnet**, and **GPT-4o**.

By utilizing a **headless architecture**, OmniLLM achieves near-zero latency by removing UI-related overhead. It operates exclusively as a tool provider, ensuring maximum system resources are dedicated entirely to token throughput and intelligent routing.

---

## 💎 Flagship Model: Gemma 4 31B

OmniLLM is optimized for the **Gemma 4** family. It currently targets **`gemma-4-31b-it`** as its primary engine for the Google Gemini provider, offering state-of-the-art reasoning and instruction-following capabilities directly via MCP tools.

---

## 💻 Prerequisites & Native Installation

We have designed OmniLLM so that you **do not need to use any third-party package managers** (like Homebrew or Chocolatey) or container tools (like Docker). You can install everything directly natively on your system.

### Step 1: Install Required Software Natively

#### 🍎 For macOS Users
1. **Node.js (v18+)**: 
   - Go to the official Node.js website: [nodejs.org](https://nodejs.org/)
   - Download the **macOS Installer (.pkg)** for the LTS (Long Term Support) version.
   - Run the installer and follow the standard installation prompts.
2. **Git**: 
   - Open your `Terminal` app.
   - Type `git --version` and press Enter. If Git is not installed, your Mac will automatically prompt you to install the **Xcode Command Line Tools** (which includes Git). Click "Install".

#### 🪟 For Windows Users
1. **Node.js (v18+)**: 
   - Go to the official Node.js website: [nodejs.org](https://nodejs.org/)
   - Download the **Windows Installer (.msi)** for the LTS version.
   - Run the installer. Ensure that the option to add Node.js to your system `PATH` is checked (it usually is by default).
2. **Git**: 
   - Go to the official Git website: [git-scm.com/download/win](https://git-scm.com/download/win)
   - Download the **Standalone Installer** (64-bit).
   - Run the installer and click "Next" through the standard default settings.

---

### Step 2: Clone & Install the Project

Once Git and Node.js are installed, open your terminal (Terminal on Mac, Command Prompt or PowerShell on Windows) and run the following commands exactly as shown:

```bash
# 1. Clone the repository directly to your machine
git clone https://github.com/ManiDeep1822/OmniLLM.git

# 2. Navigate into the project folder
cd OmniLLM

# 3. Install the project dependencies natively via npm
npm install
```

---

### Step 3: Configuration & Environment Setup

You need to provide your API keys to the server. We use a `.env` file to store these securely on your local machine.

#### Mac:
```bash
cp .env.example .env
```
#### Windows:
```cmd
copy .env.example .env
```

Open the newly created `.env` file in any standard text editor (like Notepad on Windows or TextEdit on Mac) and add your API keys:
- `GEMINI_API_KEY=your_key_here` (Required for Gemma 4)
- `CLAUDE_API_KEY=your_key_here`
- `OPENAI_API_KEY=your_key_here`

---

### Step 4: Database Setup & Launch

OmniLLM uses a lightweight local SQLite database to persist context and logs. Initialize it and start the server:

```bash
# Generate the database client
npx prisma generate

# Create the initial database tables
npx prisma migrate dev --name init

# Start the server in development/watch mode
npm run dev
```

*(Note: The server will listen for MCP JSON-RPC commands over standard input/output. It is completely normal if it looks like it is "hanging" in your terminal; it is waiting for an AI agent to communicate with it!)*

---

## 🚀 Production Build

If you are running the gateway in a production environment, you should compile the TypeScript code to plain JavaScript for maximum performance:

```bash
npm run build
npm start
```

---

## 🔧 Connecting AI Agents (MCP Integration)

To use OmniLLM in your favorite agentic environment (like Claude Desktop or Antigravity), you simply need to point it to the built server file. 

Add the following to your MCP configuration file (`mcp_config.json`):

**Mac Path**: `/Users/YOUR_USER_NAME/path/to/OmniLLM/dist/server.js`  
**Windows Path**: `C:/Users/YOUR_USER_NAME/path/to/OmniLLM/dist/server.js`

```json
{
  "mcpServers": {
    "llm-gateway": {
      "command": "node",
      "args": ["/ABSOLUTE/PATH/TO/OmniLLM/dist/server.js"],
      "env": {
        "GEMINI_API_KEY": "YOUR_GEMINI_KEY",
        "CLAUDE_API_KEY": "YOUR_CLAUDE_KEY",
        "OPENAI_API_KEY": "YOUR_OPENAI_KEY",
        "DATABASE_URL": "file:./dev.db"
      }
    }
  }
}
```

---

## 🛠️ Available MCP Tools

Once connected, your AI agents will automatically have access to the following OmniLLM capabilities:

| Tool | Capability |
| :--- | :--- |
| `stream-generate` | Real-time streaming output from **Gemma 4**, Claude, or OpenAI directly to the user. |
| `auto-router` | Automatically routes tasks to the most efficient model based on task complexity. |
| `multi-step-chain` | Executes complex, sequential reasoning prompts where each output informs the next step. |
| `model-comparison` | Runs a single prompt across all configured providers simultaneously to compare answer quality. |
| `context-chain` | Persistent conversation memory system backed by the local SQLite database. |

---

## 🛡️ Architecture & Monitoring

OmniLLM uses a dual-interface approach:
- **Stdio (Primary)**: High-speed binary/text channel for MCP tool communication.
- **HTTP/JSON (Secondary)**: Lightweight health and configuration API operating on port **4324**.

**Health Check endpoint:** `http://localhost:4324/api/health`

**Database Logs:** As a headless gateway, OmniLLM logs all complex activity to the SQLite database. To view it visually, run:
```bash
npx prisma studio
```

---

## 📄 License

This project is licensed under the **MIT License**.

<div align="center">
  <sub>Built with ❤️ by <a href="https://github.com/ManiDeep1822">Indla Mohana Venkata Mani Deep</a></sub>
</div>
