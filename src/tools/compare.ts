import { z } from 'zod';
import { handleStreamingRequest } from '../utils/streaming-helper.js';
import { registry } from '../providers/index.js';

export const modelComparisonTool = {
  name: 'model-comparison',
  description: 'Compares responses from Claude, GPT-4o, and Gemini for the same prompt.',
  schema: {
    prompt: z.string().describe('The prompt to compare across models')
  },
  handler: async (args: any) => {
    const availableProviders = registry.getAvailableProviders();
    const targets = [
      { name: 'anthropic', key: 'CLAUDE' },
      { name: 'openai', key: 'GPT4O' },
      { name: 'google', key: 'GEMINI_FLASH' }
    ].filter(p => availableProviders.includes(p.name));

    if (targets.length === 0) {
      throw new Error("No LLM providers are configured for comparison.");
    }

    const results = await Promise.allSettled(
      targets.map(p => handleStreamingRequest(args.prompt, p.name, { modelKey: p.key }))
    );

    const comparison = results.map((res, i) => {
      const provider = targets[i].name;
      const response = res.status === 'fulfilled' ? res.value : `Error: ${res.reason}`;
      return `### Provider: ${provider}\n\n${response}\n\n---`;
    }).join('\n\n');

    return {
      content: [{ type: 'text', text: comparison }]
    };
  }
};
