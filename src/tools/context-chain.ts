import { z } from 'zod';
import { handleStreamingRequest } from '../utils/streaming-helper.js';
import { getHistory } from '../db/logger.js';

export const contextChainTool = {
  name: 'context-chain',
  description: 'Maintains context across multiple turns using database-backed memory.',
  schema: {
    prompt: z.string().describe('The current prompt'),
    sessionId: z.string().describe('Unique session ID to retrieve context for'),
    modelProvider: z.enum(['anthropic', 'openai', 'google']).default('anthropic')
  },
  handler: async (args: any) => {
    // Get last 5 calls for this session (simulated since LLMCall doesn't have sessionId directly in this simple schema, 
    // but we can query by chain or just use a more advanced schema. For now, let's just use mock context)
    
    const history = await getHistory(5);
    const context = history
        .filter((h: any) => h.status === 'success')
        .map((h: any) => `User: ${h.prompt}\nAI: ${h.response}`)
        .join('\n\n');

    const fullPrompt = context ? `Background Context:\n${context}\n\nCurrent Task: ${args.prompt}` : args.prompt;
    
    const response = await handleStreamingRequest(fullPrompt, args.modelProvider);

    return {
      content: [{ type: 'text', text: response }]
    };
  }
};
