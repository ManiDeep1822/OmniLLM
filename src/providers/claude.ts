import Anthropic from '@anthropic-ai/sdk';
import { LLMProvider, StreamHandler, ProviderResponse } from './index.js';
import { config, MODELS, getActiveModel } from '../config.js';

export class ClaudeProvider implements LLMProvider {
  name = 'Anthropic Claude';
  private client: Anthropic;

  constructor() {
    this.client = new Anthropic({
      apiKey: config.CLAUDE_API_KEY || '',
    });
  }

  private resolveModel(options: any): string {
    const { activeProvider, activeModel } = getActiveModel();
    if (activeProvider === 'claude') return activeModel;
    return options.model || MODELS.CLAUDE.id;
  }

  async generate(prompt: string, options: any = {}): Promise<ProviderResponse> {
    const response = await this.client.messages.create({
      model: this.resolveModel(options),
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
      model: this.resolveModel(options),
      max_tokens: options.maxTokens || 4096,

      messages: [{ role: 'user', content: prompt }],
      system: options.systemPrompt,
      stream: true,
    });

    for await (const event of stream) {
      if (event.type === 'message_start') {
        handler({
          text: '',
          isFinished: false,
          usage: {
            promptTokens: event.message.usage.input_tokens,
            completionTokens: 0
          }
        });
      } else if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        handler({ text: event.delta.text, isFinished: false });
      } else if (event.type === 'message_delta') {
        // Final usage info
        handler({ 
            text: '', 
            isFinished: false, 
            usage: { 
                promptTokens: 0, 
                completionTokens: event.usage.output_tokens 
            } 
        });
      } else if (event.type === 'message_stop') {
        handler({ text: '', isFinished: true });
      }
    }
  }
}
