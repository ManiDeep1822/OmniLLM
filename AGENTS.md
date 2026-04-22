# LLMGateway Agent Guide

This MCP server provides advanced LLM orchestration tools for Antigravity agents. Follow these instructions to maximize the utility of OmniLLM.

## Preferred Operation Patterns

- **Initialization**: Use `auto-router` for all code generation tasks. It will pick the most efficient model automatically.
- **Complex Tasks**: Use `multi-step-chain` when a feature requires more than 3 distinct steps or logical stages.
- **Critical Solutions**: Use `model-comparison` when you need the absolute best possible solution or need to verify cross-model agreement.
- **Rapid Iteration**: Use `stream-generate` with **Gemini** for fast coding iteration and simple logic.
- **Architectural Design**: Use `stream-generate` with **Claude** for high-level architecture decisions and complex reasoning.

## Rule of Context

Always pass the **full file context** in your prompts to ensure the gateway has enough information to maintain accurate chains and memory.


