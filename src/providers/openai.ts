import OpenAI from 'openai';
import { LLMProvider, StreamHandler, ProviderResponse } from './index.js';    
import { config, MODELS } from '../config.js';

export class OpenAIProvider implements LLMProvider {
  name = 'OpenAI';
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: config.OPENAI_API_KEY || '',
    });
  }

  async generate(prompt: string, options: any = {}): Promise<ProviderResponse> {
    const response = await this.client.chat.completions.create({
      model: options.model || MODELS.GPT4O.id,
      messages: [
        ...(options.systemPrompt ? [{ role: 'system' as const, content: options.systemPrompt }] : []),
        { role: 'user' as const, content: prompt }
      ],
      max_tokens: options.maxTokens,
    });

    return {
      content: response.choices[0].message.content || '',
      usage: {
        promptTokens: response.usage?.prompt_tokens || 0,
        completionTokens: response.usage?.completion_tokens || 0,
      },
    };
  }

  async stream(prompt: string, handler: StreamHandler, options: any = {}): Promise<void> {
    const stream = await this.client.chat.completions.create({
      model: options.model || MODELS.GPT4O.id,
      messages: [
        ...(options.systemPrompt ? [{ role: 'system' as const, content: options.systemPrompt }] : []),
        { role: 'user' as const, content: prompt }
      ],
      max_tokens: options.maxTokens,
      stream: true,
      stream_options: { include_usage: true }
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        handler({ text: content, isFinished: false });
      }
      
      if (chunk.usage) {
        handler({
          text: '',
          isFinished: false,
          usage: {
            promptTokens: chunk.usage.prompt_tokens,
            completionTokens: chunk.usage.completion_tokens,
          }
        });
      }

      if (chunk.choices[0]?.finish_reason) {
        handler({ text: '', isFinished: true });
      }
    }
  }
}
