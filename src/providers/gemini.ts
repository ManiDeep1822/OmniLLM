import { GoogleGenerativeAI } from '@google/generative-ai';
import { LLMProvider, StreamHandler, ProviderResponse } from './index.js';
import { config, MODELS } from '../config.js';

export class GeminiProvider implements LLMProvider {
  name = 'Google Gemini';
  private genAI: GoogleGenerativeAI;

  constructor() {
    this.genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY || '');
  }

  async generate(prompt: string, options: any = {}): Promise<ProviderResponse> {
    const model = this.genAI.getGenerativeModel({ 
        model: options.model || MODELS.GEMINI_PRO.id,
        systemInstruction: options.systemPrompt 
    });
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    // Gemini doesn't always provide detailed token counts in the simple response object
    // but we can try to estimate or get metadata if available
    return {
      content: response.text(),
      usage: {
        promptTokens: response.usageMetadata?.promptTokenCount || 0,
        completionTokens: response.usageMetadata?.candidatesTokenCount || 0,
      },
    };
  }

  async stream(prompt: string, handler: StreamHandler, options: any = {}): Promise<void> {
    const model = this.genAI.getGenerativeModel({ 
        model: options.model || MODELS.GEMINI_PRO.id,
        systemInstruction: options.systemPrompt 
    });
    
    const result = await model.generateContentStream(prompt);

    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      if (chunkText) {
        handler({ text: chunkText, isFinished: false });
      }
    }

    // Final usage info
    const response = await result.response;
    handler({
        text: '',
        isFinished: false,
        usage: {
            promptTokens: response.usageMetadata?.promptTokenCount || 0,
            completionTokens: response.usageMetadata?.candidatesTokenCount || 0,
        }
    });

    handler({ text: '', isFinished: true });
  }
}
