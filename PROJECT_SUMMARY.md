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
- **Claude (Anthropic)**: Support for `claude-3-5-sonnet-20241022`.
- **GPT-4o (OpenAI)**: Support for flagship and mini models.
- **Gemini (Google)**: Optimized for `gemini-1.5-flash` with a sequence-based fallback system through the Gemini family.
- **Registry Pattern**: A centralized `ProviderRegistry` manages instantiation and ensures that only providers with valid API keys are exposed as tools.

### 3. Persistence Layer (`prisma/`)
- **SQLite Database**: A lightweight, local database for storing interaction logs, token counts, and cost metrics.
- **Prisma ORM**: Modern database access layer with a fully typed schema.

---

## ✨ Core Tools

- **`stream-generate`**: Standard text generation with raw streaming throughput.
- **`multi-step-chain`**: Sequential reasoning where the context of one step feeds into the next.
- **`auto-router`**: A complexity-aware router that selects the most efficient model based on the task description.
- **`model-comparison`**: Parallel execution tool for side-by-side benchmarking of different providers.
- **`context-chain`**: Persistent conversation memory across sessions using the SQLite backend.

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
