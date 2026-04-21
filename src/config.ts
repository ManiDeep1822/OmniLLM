import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  CLAUDE_API_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().default('gemma-4-27b-it'),
  PORT: z.string().default('3000'),
  DASHBOARD_PORT: z.string().default('5173'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

export const config = envSchema.parse(process.env);

export const GEMINI_MODELS = [
  config.GEMINI_MODEL,
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash'
];


export const MODELS = {
  CLAUDE: {
    id: 'claude-3-5-sonnet-20241022',
    provider: 'anthropic',
    inputCost: 3.0, 
    outputCost: 15.0,
  },
  GPT4O: {
    id: 'gpt-4o',
    provider: 'openai',
    inputCost: 5.0,
    outputCost: 15.0,
  },
  GPT4O_MINI: {
    id: 'gpt-4o-mini',
    provider: 'openai',
    inputCost: 0.15,
    outputCost: 0.6,
  },
  GEMINI_FLASH: {
    id: GEMINI_MODELS[0],
    provider: 'google',
    inputCost: 0.1,
    outputCost: 0.4,
  }
};

export type ModelType = keyof typeof MODELS;

// Runtime Configuration
let runtimeConfig = {
  activeProvider: 'gemini',
  activeModel: GEMINI_MODELS[0]
};

export function getActiveModel() {
  return runtimeConfig;
}

export function setActiveModel(provider: string, model: string) {
  runtimeConfig.activeProvider = provider;
  runtimeConfig.activeModel = model;
}

export function getAvailableModelsGrouped() {
  return {
    gemini: {
       configured: !!config.GEMINI_API_KEY?.trim(),
       models: GEMINI_MODELS
    },
    claude: {
       configured: !!config.CLAUDE_API_KEY?.trim(),
       models: ['claude-3-5-sonnet-20241022', 'claude-3-haiku-20240307']
    },
    openai: {
       configured: !!config.OPENAI_API_KEY?.trim(),
       models: ['gpt-4o', 'gpt-4o-mini']
    }
  };
}

