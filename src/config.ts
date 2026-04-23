import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  CLAUDE_API_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().default("gemma-4-31b-it"),
  PORT: z.string().default("4324"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

export const config = envSchema.parse(process.env);

export const GEMINI_MODELS = [
  "gemma-4-31b-it",
  "gemma-4-26b-a4b-it",
];

export const MODELS = {
  CLAUDE: {
    id: "claude-3-5-sonnet-20241022",
    provider: "anthropic",
    inputCost: 3.0,
    outputCost: 15.0,
  },
  GPT4O: {
    id: "gpt-4o",
    provider: "openai",
    inputCost: 5.0,
    outputCost: 15.0,
  },
  GPT4O_MINI: {
    id: "gpt-4o-mini",
    provider: "openai",
    inputCost: 0.15,
    outputCost: 0.6,
  },
  GEMINI_FLASH: {
    id: "gemma-4-31b-it",
    provider: "google",
    inputCost: 0.1,
    outputCost: 0.4,
  },
  GEMINI_20_FLASH: {
    id: "gemini-2.0-flash",
    provider: "google",
    inputCost: 0.1,
    outputCost: 0.4,
  },
  GEMINI_PRO: {
    id: "gemini-1.5-pro",
    provider: "google",
    inputCost: 3.5,
    outputCost: 10.5,
  },
};

export type ModelType = keyof typeof MODELS;

// Runtime Configuration
let runtimeConfig = {
  activeProvider: "gemini",
  activeModel: "gemma-4-31b-it",
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
      models: GEMINI_MODELS,
    },
    claude: {
      configured: !!config.CLAUDE_API_KEY?.trim(),
      models: ["claude-3-5-sonnet-20241022", "claude-3-haiku-20240307"],
    },
    openai: {
      configured: !!config.OPENAI_API_KEY?.trim(),
      models: ["gpt-4o", "gpt-4o-mini"],
    },
  };
}
