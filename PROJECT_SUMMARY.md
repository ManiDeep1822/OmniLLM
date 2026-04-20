# LLMGateway: Project Summary & Technical Report

This document provides a detailed overview of the LLMGateway MCP Server project, built for Google Antigravity.

## 🚀 Project Overview
LLMGateway is a production-grade **Model Context Protocol (MCP)** server that acts as a universal, autonomous LLM router. It enables Antigravity agents to seamlessly switch between Claude, OpenAI, and Gemini while providing real-time monitoring via a high-performance web dashboard.

---

## 🏗️ Technical Architecture

### 1. Dual-Port Server Core (`src/server.ts`)
- **MCP Stdio Layer**: Communicates with host applications (like Claude Desktop or Antigravity) via standard I/O.
- **Dashboard API Layer**: An Express.js server running on **Port 3000** that exposes analytics and historical data.
- **Real-time Streaming Layer**: Uses **Socket.IO** to broadcast token-by-token generation events from the backend to the frontend with sub-100ms latency.

### 2. Multi-Provider Integration (`src/providers/`)
- **Claude (Anthropic)**: Integration with `claude-3-5-sonnet`.
- **GPT-4o (OpenAI)**: Support for flagship and mini models.
- **Gemini (Google)**: Optimized for **Gemini 2.5 Flash**, providing high-throughput streaming and avoiding rate limits on free tiers.
- **Registry Pattern**: A central `ProviderRegistry` identifies available keys and ensures graceful fallbacks if a provider is missing an API key.

### 3. Persistence Layer (`prisma/`)
- **SQLite Database**: A lightweight, local database for storing every LLM interaction, token counts, and cost metrics.
- **Prisma ORM**: Modern database access layer with a fully typed schema.

---

## ✨ Core Features & Tools

### 🛠️ MCP Tools
- **`stream-generate`**: Universal streaming text generation across any provider.
- **`multi-step-chain`**: Sequential reasoning tool where the context of one LLM call automatically feeds into the next.
- **`auto-router`**: A complexity-aware router that selects Gemini for coding, GPT-4o for creative tasks, and GPT-4o Mini for simple requests.
- **`model-comparison`**: Parallel execution tool that shows side-by-side responses from all available models.

### 📊 Monitoring Dashboard (`dashboard-ui/`)
- **Live Streaming Feed**: A terminal-style UI showing tokens as they arrive, color-coded by provider.
- **Cost Tracker**: Real-time visualization of daily/weekly spending based on token usage.
- **Call History**: A searchable record of every interaction, including prompts, responses, and token usage.
- **Operational Status**: A green-room health check ensuring backend-frontend connectivity.

---

## 🛠️ Infrastructure & Quality Assurance
- **ESM Modernization**: The entire project is built using **Pure ESM** (`"type": "module"`) for maximum performance and compatibility.
- **Type Safety**: Full TypeScript integration with `NodeNext` module resolution.
- **Unit Testing Suite**: A Jest-based testing framework configured for ESM, verifying provider instantiation and logic.

## 📁 Key File Map
- `/src/server.ts`: The main entry point.
- `/src/config.ts`: Model IDs, costs, and environment configuration.
- `/src/providers/`: Individual LLM SDK implementations.
- `/src/tools/`: The logic for individual MCP tools.
- `/dashboard-ui/`: The React-based frontend source code.
- `/.env`: Your secure API key storage.
