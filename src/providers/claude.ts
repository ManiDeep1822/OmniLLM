import Anthropic from '@anthropic-ai/sdk';
import { LLMProvider, StreamHandler, ProviderResponse } from './index.js';
import { config, MODELS } from '../config.js';

export class ClaudeProvider implements LLMProvider {
  name = 'Anthropic Claude';
  private client: Anthropic;

  constructor() {
    this.client = new Anthropic({
      apiKey: config.CLAUDE_API_KEY || '',
    });
  }

  async generate(prompt: string, options: any = {}): Promise<ProviderResponse> {
    const response = await this.client.messages.create({
      model: options.model || MODELS.CLAUDE.id,
      max_tokens: options.maxTokens || 4096,
      messages: [{ role: 'user', content: prompt }],
      system: options.systemPrompt,
    });

    const content = response.content[0].type === 'text' ? response.content[0].text : '';
    
    return {
      content,
      usage: {
        promptTokens: response.usage.input_tokens,
        completionTokens: response.usage.output_tokens,
      },
    };
  }

  async stream(prompt: string, handler: StreamHandler, options: any = {}): Promise<void> {
    const stream = await this.client.messages.create({
      model: options.model || MODELS.CLAUDE.id,
      max_tokens: options.maxTokens || 4096,
      messages: [{ role: 'user', content: prompt }],
      system: options.systemPrompt,
      stream: true,
    });

    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        handler({ text: event.delta.text, isFinished: false });
      } else if (event.type === 'message_delta') {
        // Final usage info
        handler({ 
            text: '', 
            isFinished: false, 
            usage: { 
                promptTokens: 0, // Anthropic doesn't send input tokens in delta usually
                completionTokens: event.usage.output_tokens 
            } 
        });
      } else if (event.type === 'message_stop') {
        handler({ text: '', isFinished: true });
      }
    }
  }
}
