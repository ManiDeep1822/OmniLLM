export interface ProviderResponse {
  content: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
  };
}

export type StreamHandler = (chunk: {
  text: string;
  isFinished: boolean;
  usage?: {
    promptTokens: number;
    completionTokens: number;
  };
}) => void;

export interface LLMProvider {
  name: string;
  generate(prompt: string, options?: any): Promise<ProviderResponse>;
  stream(prompt: string, handler: StreamHandler, options?: any): Promise<void>;
}

import { ClaudeProvider } from './claude.js';
import { OpenAIProvider } from './openai.js';
import { GeminiProvider } from './gemini.js';
import { MockProvider } from './mock.js';
import { config } from '../config.js';

export function getAvailableProviders(): string[] {
  const available: string[] = [];
  if (config.GEMINI_API_KEY?.trim()) available.push('gemini');
  if (config.CLAUDE_API_KEY?.trim()) available.push('claude');
  if (config.OPENAI_API_KEY?.trim()) available.push('openai');
  available.push('mock'); // Simulation always available
  return available;
}

export class ProviderRegistry {
  private providers: Map<string, LLMProvider> = new Map();

  constructor() {
    if (config.CLAUDE_API_KEY?.trim()) {
      this.providers.set('claude', new ClaudeProvider());
    }
    if (config.OPENAI_API_KEY?.trim()) {
      this.providers.set('openai', new OpenAIProvider());
    }
    if (config.GEMINI_API_KEY?.trim()) {
      this.providers.set('gemini', new GeminiProvider());
    }
    this.providers.set('mock', new MockProvider());
  }

  getAvailableProviders(): string[] {
    return Array.from(this.providers.keys());
  }

  getProvider(name: string): LLMProvider {
    let normalizedName = name.toLowerCase();
    if (normalizedName === 'google' || normalizedName === 'google gemini') normalizedName = 'gemini';
    if (normalizedName === 'anthropic' || normalizedName === 'anthropic claude') normalizedName = 'claude';
    
    const provider = this.providers.get(normalizedName);
    if (!provider) {
      const available = this.getAvailableProviders().join(', ');
      throw new Error(`Provider ${name} is not available (Missing API Key). Available: [${available}]`);
    }
    return provider;
  }

  getDefaultProvider(): LLMProvider {
    const available = this.getAvailableProviders();
    if (available.length === 0) {
      throw new Error("No LLM providers are configured. Please check your .env file.");
    }
    return this.getProvider(available[0]);
  }
}

export const registry = new ProviderRegistry();
