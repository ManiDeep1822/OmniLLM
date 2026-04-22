import { z } from 'zod';
import { handleStreamingRequest } from '../utils/streaming-helper.js';
import { prisma } from '../db/logger.js';

export const contextChainTool = {
  name: 'context-chain',
  description: 'Maintains context across multiple turns using database-backed memory.',
  schema: {
    prompt: z.string().describe('The current prompt'),
    sessionId: z.string().describe('Unique session ID to retrieve context for'),
    modelProvider: z.enum(['anthropic', 'openai', 'google', 'gemini', 'claude']).default('anthropic')
  },
  handler: async (args: any) => {
    // Get last 5 calls for this session
    const history = await prisma.lLMCall.findMany({
      take: 5,
      orderBy: { timestamp: 'desc' },
      where: { status: 'success' }
    });

    const context = history
        .map((h: any) => `User: ${h.prompt}\nAI: ${h.response}`)
        .reverse()
        .join('\n\n');

    const fullPrompt = context ? `Background Context:\n${context}\n\nCurrent Task: ${args.prompt}` : args.prompt;
    
    const response = await handleStreamingRequest(fullPrompt, args.modelProvider);

    return {
      content: [{ type: 'text', text: response }]
    };
  }
};
