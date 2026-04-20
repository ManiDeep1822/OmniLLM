# Contributing to OmniLLM

Thank you for your interest in contributing to OmniLLM! We want to make contributing to this project as easy and transparent as possible.

## Development Process

1. **Fork the Repo**: Create your own fork of the repository and clone it locally.
2. **Setup Environment**:
   - Copy `.env.example` to `.env`.
   - Add your API keys.
   - Run `npm install` and `npx prisma migrate dev`.
3. **Branching**: Create a feature branch for your changes (`git checkout -b feature/amazing-feature`).
4. **Code Style**:
   - Use **TypeScript** for all logic.
   - Follow the established architecture.
   - **Logging**: Do not use `console.log` for production code. Use `console.error` for all tracking and error logs to ensure they are captured by the MCP logs.
5. **Testing**: Run any existing tests and add new ones for your features.
6. **Pull Requests**: Submit a PR to the `main` branch with a clear description of your changes.

## Commit Messages

We prefer descriptive commit messages, for example:
- `feat: add new tool for image analysis`
- `fix: resolve streaming lag on dashboard`
- `docs: update installation instructions`

## Community

If you have questions or want to discuss features, feel free to open an issue or start a discussion.

Happy coding! 🚀
