import { z } from 'zod';
import { handleStreamingRequest } from '../utils/streaming-helper.js';

export const streamGenerateTool = {
  name: 'stream-generate',
  description: 'Generates an LLM response with real-time streaming to the dashboard.',
  schema: {
    prompt: z.string().describe('The user prompt to generate a response for'),
    modelProvider: z.enum(['anthropic', 'openai', 'google']).default('anthropic'),
    systemPrompt: z.string().optional().describe('Optional system instructions'),
    modelKey: z.string().optional().describe('Optional model key (e.g., CLAUDE, GPT4O, GEMINI_PRO)')
  },
  handler: async (args: any) => {
    try {
      const text = await handleStreamingRequest(args.prompt, args.modelProvider, {
        systemPrompt: args.systemPrompt,
        modelKey: args.modelKey
      });

      return {
        content: [{ type: 'text', text }]
      };
    } catch (error: any) {
      console.error('MCP Tool Error (stream-generate):', error.message);
      return {
        content: [{ 
          type: 'text', 
          text: `Error: ${error.message}. Please check gateway logs or configuration.` 
        }],
        isError: true
      };
    }
  }
};
