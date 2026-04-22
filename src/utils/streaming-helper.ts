import { registry } from '../providers/index.js';
import { StreamBuffer } from '../streaming/buffer.js';
import { logCall } from '../db/logger.js';
import { MODELS } from '../config.js';

export const handleStreamingRequest = async (
  prompt: string, 
  providerName: string, 
  options: any = {}
): Promise<string> => {
  const provider = registry.getProvider(providerName);
  const buffer = new StreamBuffer();
  const startTime = Date.now();
  
  // Assign a default modelKey based on the providerName
  let defaultKey = 'CLAUDE';
  const normProvider = providerName.toLowerCase();
  if (normProvider === 'gemini' || normProvider === 'google') defaultKey = 'GEMINI_FLASH';
  else if (normProvider === 'openai') defaultKey = 'GPT4O';
  
  const modelKey = options.modelKey || defaultKey;
  const modelInfo = (MODELS as any)[modelKey] || MODELS[defaultKey as keyof typeof MODELS] || MODELS.CLAUDE;

  console.error(`Starting stream for ${providerName} using ${modelInfo.id}`);

  try {
    await provider.stream(prompt, async (chunk) => {
      if (chunk.text) {
        buffer.addToken(chunk.text);
      }

      if (chunk.isFinished) {
        const metrics = buffer.getMetrics(
          modelInfo.inputCost,
          modelInfo.outputCost,
          chunk.usage?.promptTokens || 0
        );

        console.error(`Stream complete. Tokens: ${metrics.totalTokens}, Cost: ${metrics.cost}`);

        // Log to DB
        logCall({
          modelProvider: providerName,
          modelName: modelInfo.id,
          prompt,
          response: buffer.getFullText(),
          tokenCount: metrics.totalTokens,
          costEstimate: metrics.cost,
          latencyMs: Date.now() - startTime,
          isStreamed: true,
          status: 'success'
        });
      }
    }, options);
  } catch (error: any) {
    console.error(`Primary provider ${providerName} failed: ${error.message}.`);

    logCall({
      modelProvider: providerName,
      modelName: modelInfo.id,
      prompt,
      response: `Error: ${error.message}`,
      tokenCount: 0,
      costEstimate: 0,
      latencyMs: Date.now() - startTime,
      isStreamed: true,
      status: 'failed'
    });

    throw error;
  }

  return buffer.getFullText();
};
