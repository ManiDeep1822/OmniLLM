import { z } from 'zod';
import { handleStreamingRequest } from '../utils/streaming-helper.js';
import { getAvailableProviders } from '../providers/index.js';

function getProviderSequence(taskType: string): string[] {
  const available = getAvailableProviders();
  
  if (available.length === 0) {
    throw new Error('No API keys configured. Please add at least one API key to your .env file.');
  }

  // Preferred routing based on task type
  const preferences: Record<string, string[]> = {
    'coding': ['gemini', 'openai', 'claude', 'mock'],
    'reasoning': ['claude', 'openai', 'gemini', 'mock'],
    'creative': ['openai', 'claude', 'gemini', 'mock'],
    'simple': ['gemini', 'openai', 'claude', 'mock'],
    'default': ['gemini', 'openai', 'claude', 'mock']
  };

  const order = preferences[taskType] || preferences['default'];
  
  // Create a sequence that starts with preferred providers, then includes all remaining available ones
  const sequence = [
    ...order.filter(p => available.includes(p)),
    ...available.filter(p => !order.includes(p))
  ];

  return [...new Set(sequence)]; // Deduplicate and return
}

export const autoRouterTool = {
  name: 'auto-router',
  description: 'Automatically selects the best model and falls back to others on failure.',
  schema: {
    task: z.string().describe('Description of the task or the final prompt')
  },
  handler: async (args: any) => {
    const task = args.task.toLowerCase();
    
    // Determine task type for routing
    let taskType = 'default';
    if (task.includes('code') || task.includes('program') || task.includes('fix')) taskType = 'coding';
    else if (task.includes('why') || task.includes('explain') || task.includes('reason')) taskType = 'reasoning';
    else if (task.includes('write') || task.includes('story') || task.includes('create')) taskType = 'creative';
    else if (task.length < 50) taskType = 'simple';

    const providers = getProviderSequence(taskType);
    const errors: string[] = [];
    
    const modelKeyMap: Record<string, string> = {
      'claude': 'CLAUDE',
      'openai': 'GPT4O',
      'gemini': 'GEMINI_FLASH',
      'mock': 'MOCK'
    };

    // Try providers in sequence until one succeeds
    for (const provider of providers) {
      const modelKey = modelKeyMap[provider];
      if (!modelKey) continue;

      try {
        if (errors.length > 0) {
          console.error(`Attempting fallback to ${provider}...`);
        }
        
        const response = await handleStreamingRequest(args.task, provider, { modelKey });

        return {
          content: [{ 
            type: 'text', 
            text: `${errors.length > 0 ? `[Fallback Active: ${errors.length} failed] ` : ''}[Routed to ${modelKey}]\n\n${response}` 
          }]
        };
      } catch (error: any) {
        const msg = `${provider}: ${error.message}`;
        console.error(`Router fallback trigger: ${msg}`);
        errors.push(msg);
        
        // Continue to next provider in loop
      }
    }

    // If we're here, all providers failed
    return {
      content: [{ 
        type: 'text', 
        text: `Router failed for all attempted providers:\n${errors.join('\n')}` 
      }],
      isError: true
    };
  }
};
