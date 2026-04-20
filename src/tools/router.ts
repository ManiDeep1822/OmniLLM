import { z } from 'zod';
import { handleStreamingRequest } from '../utils/streaming-helper.js';
import { registry } from '../providers/index.js';

export const autoRouterTool = {
  name: 'auto-router',
  description: 'Automatically selects the best model based on task type and complexity.',
  schema: {
    task: z.string().describe('Description of the task or the final prompt')
  },
  handler: async (args: any) => {
    const task = args.task.toLowerCase();
    let provider = 'anthropic';
    let modelKey = 'CLAUDE';

    const available = registry.getAvailableProviders();
    if (!available.includes(provider)) {
       const fallback = registry.getDefaultProvider();
       provider = fallback.name === 'Anthropic Claude' ? 'anthropic' : 
                  fallback.name === 'OpenAI' ? 'openai' : 'google';
       modelKey = provider === 'anthropic' ? 'CLAUDE' : 
                  provider === 'openai' ? 'GPT4O' : 'GEMINI_PRO';
    }

    try {
      const response = await handleStreamingRequest(args.task, provider, { modelKey });

      return {
        content: [{ type: 'text', text: `[Routed to ${modelKey}]\n\n${response}` }]
      };
    } catch (error: any) {
      console.error('MCP Tool Error (auto-router):', error.message);
      return {
        content: [{ 
          type: 'text', 
          text: `Router failed: ${error.message}` 
        }],
        isError: true
      };
    }
  }
};
