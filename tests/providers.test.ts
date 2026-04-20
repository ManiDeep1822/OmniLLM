import { describe, test, expect } from '@jest/globals';
import { ClaudeProvider } from '../src/providers/claude.js';
import { OpenAIProvider } from '../src/providers/openai.js';
import { GeminiProvider } from '../src/providers/gemini.js';

describe('LLM Providers', () => {
  test('ClaudeProvider should be instantiable', () => {
    const provider = new ClaudeProvider();
    expect(provider.name).toContain('Claude');
  });

  test('OpenAIProvider should be instantiable', () => {
    const provider = new OpenAIProvider();
    expect(provider.name).toContain('OpenAI');
  });

  test('GeminiProvider should be instantiable', () => {
    const provider = new GeminiProvider();
    expect(provider.name).toContain('Gemini');
  });
});
