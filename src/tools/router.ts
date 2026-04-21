import { z } from 'zod';
import { handleStreamingRequest } from '../utils/streaming-helper.js';
import { getAvailableProviders } from '../providers/index.js';

function selectBestAvailableProvider(taskType: string): string {
  const available = getAvailableProviders();
  
  if (available.length === 0) {
    throw new Error('No API keys configured. Please add at least one API key to your .env file.');
  }

  // Preferred routing based on task type
  const preferences: Record<string, string[]> = {
    'coding': ['gemini', 'openai', 'claude'],
    'reasoning': ['claude', 'openai', 'gemini'],
    'creative': ['openai', 'claude', 'gemini'],
    'simple': ['gemini', 'openai', 'claude'],
    'default': ['gemini', 'openai', 'claude']
  };

  const order = preferences[taskType] || preferences['default'];
  
  // Pick first preferred provider that is actually available
  for (const provider of order) {
    if (available.includes(provider)) {
      return provider;
    }
  }

  // Fallback to first available
  return available[0];
}

export const autoRouterTool = {
  name: 'auto-router',
  description: 'Automatically selects the best model based on task type and complexity.',
  schema: {
    task: z.string().describe('Description of the task or the final prompt')
  },
  handler: async (args: any) => {
    const task = args.task.toLowerCase();
    
    try {
      // Determine task type for routing
      let taskType = 'default';
      if (task.includes('code') || task.includes('program') || task.includes('fix')) taskType = 'coding';
      else if (task.includes('why') || task.includes('explain') || task.includes('reason')) taskType = 'reasoning';
      else if (task.includes('write') || task.includes('story') || task.includes('create')) taskType = 'creative';
      else if (task.length < 50) taskType = 'simple';

      const provider = selectBestAvailableProvider(taskType);
      
      // Map provider to modelKey
      const modelKeyMap: Record<string, string> = {
        'claude': 'CLAUDE',
        'openai': 'GPT4O',
        'gemini': 'GEMINI_PRO'
      };
      
      const modelKey = modelKeyMap[provider];

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
