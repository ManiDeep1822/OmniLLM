# LLMGateway: Project Summary & Technical Report

This document provides a detailed overview of the LLMGateway MCP Server project, built for high-performance agentic workflows.

## 🚀 Project Overview
LLMGateway is a production-grade **Model Context Protocol (MCP)** server that acts as a universal, autonomous LLM router. It enables AI agents to seamlessly switch between Claude, OpenAI, and Gemini with zero-latency token throughput. 

In v1.2.0, the project transitioned to a **headless architecture**, removing all dashboard overhead to maximize stability and speed for autonomous agents.

---

## 🏗️ Technical Architecture

### 1. Pure MCP Core (`src/server.ts`)
- **MCP Stdio Transport**: Optimized standard I/O communication for dedicated use as an IDE tool-provider.
- **Async Streaming Engine**: A non-blocking streaming pipeline that delivers tokens directly to the client with zero buffering.
- **Protocol Isolation**: All system logs are routed to `STDERR`, ensuring `STDOUT` is reserved exclusively for the MCP JSON-RPC protocol.

### 2. Multi-Provider Integration (`src/providers/`)
- **Claude (Anthropic)**: Optimized for Claude 3.5 Sonnet.
- **GPT-4o (OpenAI)**: Full usage tracking via `stream_options`.
- **Gemini (Google)**: Specialized for **Gemma 4** (`gemma-4-31b-it`) with a direct, zero-simulation provider logic.
- **Registry Pattern**: A centralized `ProviderRegistry` manages instantiation and health checks.

### 3. Persistence Layer (`prisma/`)
- **SQLite Database**: Stores interaction logs, token counts, and cost metrics.
- **Prisma ORM**: Modern database access layer with session tracking and context management.

---

## ✨ Core Tools

- **`stream-generate`**: Standard text generation with raw streaming throughput.
- **`multi-step-chain`**: Sequential reasoning with incremental result delivery.
- **`auto-router`**: A complexity-aware router that selects the best model for the task.
- **`model-comparison`**: Parallel execution tool for side-by-side benchmarking.
- **`context-chain`**: Persistent conversation memory with isolated sessions.

---

## 🛠️ Infrastructure & Quality Assurance
- **ESM Modernization**: Built using **Pure ESM** for maximum performance.
- **Headless Performance**: Removed Socket.IO and UI emission overhead.
- **Health Monitoring**: Lightweight HTTP API on port **4324** for status checks.

## 📁 Key File Map
- `/src/server.ts`: The main entry point and MCP/HTTP server.
- `/src/config.ts`: Centralized model IDs and provider settings.
- `/src/providers/`: Individual LLM SDK implementations.
- `/src/tools/`: MCP tool logic and handlers.
- `/prisma/schema.prisma`: SQLite database schema.
