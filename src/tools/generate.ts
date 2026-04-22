import { z } from 'zod';
import { handleStreamingRequest } from '../utils/streaming-helper.js';
import { getAvailableProviders } from '../providers/index.js';

export const streamGenerateTool = {
  name: 'stream-generate',
  description: 'Generates an LLM response with real-time streaming to the dashboard.',
  schema: {
    prompt: z.string().describe('The user prompt to generate a response for'),
    modelProvider: z.enum(['anthropic', 'openai', 'google', 'gemini', 'claude', 'mock']).default('google'),
    systemPrompt: z.string().optional().describe('Optional system instructions'),
    modelKey: z.string().optional().describe('Optional model key (e.g., CLAUDE, GPT4O, GEMINI_PRO)')
  },
  handler: async (args: any) => {
    const available = getAvailableProviders();
    let provider = args.modelProvider;
    if (provider === 'google') provider = 'gemini';
    if (provider === 'anthropic') provider = 'claude';

    try {
      const text = await handleStreamingRequest(args.prompt, provider, {
        systemPrompt: args.systemPrompt,
        modelKey: args.modelKey
      });

      return {
        content: [{ type: 'text', text }]
      };
    } catch (error: any) {
      console.error(`stream-generate primary failed (${provider}), falling back to mock...`);
      try {
        const text = await handleStreamingRequest(args.prompt, available[0], {
          modelKey: 'MOCK'
        });
        return {
          content: [{ 
            type: 'text', 
            text: `[Fallback Active: ${provider} failed] ${text}` 
          }]
        };
      } catch (mockError: any) {
        return {
          content: [{ 
            type: 'text', 
            text: `Error: ${error.message}. Simulation fallback also failed.` 
          }],
          isError: true
        };
      }
    }
  }
};
