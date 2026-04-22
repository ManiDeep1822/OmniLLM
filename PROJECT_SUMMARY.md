# LLMGateway: Project Summary & Technical Report

This document provides a detailed overview of the LLMGateway MCP Server project, built for high-performance agentic workflows.

## 🚀 Project Overview
LLMGateway is a production-grade **Model Context Protocol (MCP)** server that acts as a universal, autonomous LLM router. It enables AI agents to seamlessly switch between Claude, OpenAI, and Gemini with zero-latency token throughput. 

In v1.2.0, the project transitioned to a **headless architecture**, removing all dashboard overhead to maximize stability and speed for autonomous agents.

---

## 🏗️ Technical Architecture

### 1. Pure MCP Core (`src/server.ts`)
- **MCP Stdio Transport**: Optimized standard I/O communication for dedicated use as an IDE tool-provider.
- **Async Streaming Engine**: A non-blocking streaming pipeline that delivers tokens directly to the client with zero buffering. Correctly accumulates usage metadata across streaming chunks for precise cost tracking.
- **Protocol Isolation**: All system logs are routed to `STDERR`, ensuring `STDOUT` is reserved exclusively for the MCP JSON-RPC protocol.

### 2. Multi-Provider Integration (`src/providers/`)
- **Claude (Anthropic)**: Enhanced to capture input tokens from `message_start` events.
- **GPT-4o (OpenAI)**: Full usage tracking via `stream_options`.
- **Gemini (Google)**: Optimized for `gemini-1.5-flash` with a sequence-based fallback system and reliable usage metadata capture.
- **Registry Pattern**: A centralized `ProviderRegistry` manages instantiation.

### 3. Persistence Layer (`prisma/`)
- **SQLite Database**: Stores interaction logs, token counts, and cost metrics. Now includes `sessionId` for strict context isolation.
- **Prisma ORM**: Modern database access layer with a fully typed schema updated for session tracking.

---

## ✨ Core Tools

- **`stream-generate`**: Standard text generation with raw streaming throughput and session tracking.
- **`multi-step-chain`**: Sequential reasoning with integrated session and chain persistence.
- **`auto-router`**: A complexity-aware router with automated provider fallback and session isolation.
- **`model-comparison`**: Parallel execution tool for side-by-side benchmarking.
- **`context-chain`**: Persistent conversation memory with **strict session isolation**, preventing context leakage between different users.

---

## 🛠️ Infrastructure & Quality Assurance
- **ESM Modernization**: Built using **Pure ESM** for maximum performance.
- **Type Safety**: Full TypeScript integration with `NodeNext` resolution.
- **Headless Performance**: Removed Socket.IO and UI emission overhead, resulting in significantly lower latency and reduced memory footprint.

## 📁 Key File Map
- `/src/server.ts`: The main entry point.
- `/src/config.ts`: Model IDs, costs, and environment configuration.
- `/src/providers/`: Individual LLM SDK implementations.
- `/src/tools/`: The logic for individual MCP tools.
- `/.env`: Secure API key storage.
- `/prisma/schema.prisma`: Database definition.
