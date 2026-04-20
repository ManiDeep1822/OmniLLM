import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  CLAUDE_API_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  PORT: z.string().default('3000'),
  DASHBOARD_PORT: z.string().default('5173'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

export const config = envSchema.parse(process.env);

export const GEMINI_MODELS = [
  'gemini-2.0-flash-lite',      // Primary
  'gemini-2.0-flash-lite-lite',  // Fallback
  'gemini-2.0-flash-lite-lite' // Budget
];

export const MODELS = {
  CLAUDE: {
    id: 'claude-3-5-sonnet-20240620',
    provider: 'anthropic',
    inputCost: 3.0, // per 1M tokens
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
  GEMINI_PRO: {
    id: GEMINI_MODELS[0],
    provider: 'google',
    inputCost: 0.1,
    outputCost: 0.4,
  },
  GEMINI_FLASH: {
    id: GEMINI_MODELS[0],
    provider: 'google',
    inputCost: 0.1,
    outputCost: 0.4,
  }
};

export type ModelType = keyof typeof MODELS;
