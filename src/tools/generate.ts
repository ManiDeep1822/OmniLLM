import { z } from 'zod';
import { handleStreamingRequest } from '../utils/streaming-helper.js';
import { getAvailableProviders } from '../providers/index.js';

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
    const available = getAvailableProviders();
    if (args.modelProvider && !available.includes(args.modelProvider)) {
      return {
        content: [{
          type: 'text',
          text: `Provider "${args.modelProvider}" is not available. No API key configured. Available providers: ${available.join(', ')}. Please add the API key to your .env file.`
        }],
        isError: true
      };
    }

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
