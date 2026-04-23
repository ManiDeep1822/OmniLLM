import { z } from 'zod';
import { handleStreamingRequest } from '../utils/streaming-helper.js';
import { getAvailableProviders } from '../providers/index.js';

export const streamGenerateTool = {
  name: 'stream-generate',
  description: 'Generates an LLM response with real-time streaming to the dashboard.',
  schema: {
    prompt: z.string().describe('The user prompt to generate a response for'),
    modelProvider: z.enum(['anthropic', 'openai', 'google', 'gemini', 'claude']).default('google'),
    systemPrompt: z.string().optional().describe('Optional system instructions'),
    modelKey: z.string().optional().describe('Optional model key (e.g., CLAUDE, GPT4O, GEMINI_PRO)'),
    sessionId: z.string().optional().describe('Optional session identifier')
  },
  handler: async (args: any) => {
    let provider = args.modelProvider;
    if (provider === 'google') provider = 'gemini';
    if (provider === 'anthropic') provider = 'claude';

    const text = await handleStreamingRequest(args.prompt, provider, {
      systemPrompt: args.systemPrompt,
      modelKey: args.modelKey,
      sessionId: args.sessionId
    });

    return {
      content: [{ type: 'text', text }]
    };
  }
};
