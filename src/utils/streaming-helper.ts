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
  let finalUsage: any = null;
  
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

      if (chunk.usage) {
        finalUsage = {
          ...finalUsage,
          ...chunk.usage,
          // If completionTokens is already set and chunk has 0, keep the higher value
          // (Sometimes providers send partial usage then full usage)
          completionTokens: Math.max(finalUsage?.completionTokens || 0, chunk.usage.completionTokens || 0),
          promptTokens: Math.max(finalUsage?.promptTokens || 0, chunk.usage.promptTokens || 0),
        };
      }

      if (chunk.isFinished) {
        const metrics = buffer.getMetrics(
          modelInfo.inputCost,
          modelInfo.outputCost,
          finalUsage?.promptTokens || 0,
          finalUsage?.completionTokens
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
          status: 'success',
          sessionId: options.sessionId,
          chainId: options.chainId
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
      status: 'failed',
      sessionId: options.sessionId,
      chainId: options.chainId
    });

    throw error;
  }

  return buffer.getFullText();
};
