import { z } from 'zod';
import { handleStreamingRequest } from '../utils/streaming-helper.js';
import { createChainSession, updateChainSession } from '../db/logger.js';
import { emitToDashboard } from '../dashboard/socket.js';
import { EventType } from '../streaming/events.js';

export const multiStepChainTool = {
  name: 'multi-step-chain',
  description: 'Executes a sequence of prompts where each output becomes context for the next.',
  schema: {
    prompts: z.array(z.string()).describe('An array of sequential prompts'),
    modelProvider: z.enum(['anthropic', 'openai', 'google']).default('anthropic'),
    sessionId: z.string().optional().describe('Optional session identifier')
  },
  handler: async (args: any) => {
    const session = await createChainSession(args.sessionId);
    const results: string[] = [];
    let accumulatedContext = "";

    for (let i = 0; i < args.prompts.length; i++) {
      const stepPrompt = args.prompts[i];
      const fullPrompt = i === 0 ? stepPrompt : `Context: ${accumulatedContext}\n\nNext Task: ${stepPrompt}`;
      
      emitToDashboard('chain_step', {
        type: EventType.CHAIN_STEP,
        provider: args.modelProvider,
        model: 'chain',
        timestamp: new Date().toISOString(),
        data: { step: i + 1, totalSteps: args.prompts.length, prompt: stepPrompt }
      });

      const response = await handleStreamingRequest(fullPrompt, args.modelProvider, {
        chainId: session.id
      });

      results.push(response);
      accumulatedContext += `\nStep ${i + 1}: ${response}\n`;
    }

    await updateChainSession(session.id, {
      steps: results,
      completedAt: new Date()
    });

    return {
      content: [{ type: 'text', text: results.join('\n\n--- Step Split ---\n\n') }]
    };
  }
};
