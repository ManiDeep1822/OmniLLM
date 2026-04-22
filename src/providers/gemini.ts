import { GoogleGenerativeAI } from '@google/generative-ai';
import { LLMProvider, StreamHandler, ProviderResponse } from './index.js';
import { config, MODELS, GEMINI_MODELS, getActiveModel } from '../config.js';


export class GeminiProvider implements LLMProvider {
  name = 'Google Gemini';
  private genAI: GoogleGenerativeAI;

  constructor() {
    this.genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY || '');
  }

  private async withFallback<T>(fn: (modelId: string) => Promise<T>): Promise<T> {
    const { activeProvider, activeModel } = getActiveModel();
    
    // If Gemini is active AND it's not the default fallback list, try the active model first
    if (activeProvider === 'gemini') {
      try {
        return await fn(activeModel);
      } catch (error) {
        console.warn(`Selected Gemini model ${activeModel} failed, falling back to defaults...`);
      }
    }

    let lastError: any;
    for (const modelId of GEMINI_MODELS) {
      try {
        return await fn(modelId);
      } catch (error: any) {
        lastError = error;
        const is503 = error.message?.includes('503') || error.message?.includes('Service Unavailable');
        const is404 = error.message?.includes('404') || error.message?.includes('not found');
        if (is503 || is404) {
          const reason = is503 ? '503' : '404';
          console.error(`Gemini model ${modelId} failed with ${reason}. Retrying with next fallback...`);
          if (is503) await new Promise(resolve => setTimeout(resolve, 2000));
          continue;
        }
        throw error;
      }
    }
    throw lastError;
  }


  async generate(prompt: string, options: any = {}): Promise<ProviderResponse> {
    return this.withFallback(async (modelId) => {
      const model = this.genAI.getGenerativeModel({ 
          model: options.model || modelId,
          systemInstruction: options.systemPrompt 
      });
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      
      const parts = response.candidates?.[0]?.content?.parts || [];
      const textContent = parts
        .filter((p: any) => !p.thought)
        .map((p: any) => p.text || '')
        .join('');
      
      return {
        content: textContent || response.text(),
        usage: {
          promptTokens: response.usageMetadata?.promptTokenCount || 0,
          completionTokens: response.usageMetadata?.candidatesTokenCount || 0,
        },
      };
    });
  }

  async stream(prompt: string, handler: StreamHandler, options: any = {}): Promise<void> {
    return this.withFallback(async (modelId) => {
      const model = this.genAI.getGenerativeModel({ 
          model: options.model || modelId,
          systemInstruction: options.systemPrompt 
      });
      
      const result = await model.generateContentStream(prompt);

      for await (const chunk of result.stream) {
        // Skip thought/reasoning chunks from Gemma 4
        const parts = chunk.candidates?.[0]?.content?.parts || [];
        for (const part of parts) {
          if ((part as any).thought === true) continue; // Skip thinking tokens
          const chunkText = part.text || '';
          if (chunkText) {
            handler({ text: chunkText, isFinished: false });
          }
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
    });
  }
}

