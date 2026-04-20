import { registry } from '../providers/index.js';
import { StreamBuffer } from '../streaming/buffer.js';
import { emitToDashboard } from '../dashboard/socket.js';
import { EventType } from '../streaming/events.js';
import { logCall } from '../db/logger.js';
import { MODELS } from '../config.js';

export const handleStreamingRequest = async (
  prompt: string, 
  providerName: string, 
  options: any = {}
) => {
  const provider = registry.getProvider(providerName);
  const buffer = new StreamBuffer();
  const startTime = Date.now();
  const modelKey = options.modelKey || 'CLAUDE';
  const modelInfo = (MODELS as any)[modelKey] || MODELS.CLAUDE;

  console.error(`Starting stream for ${providerName} using ${modelInfo.id}`);

  await provider.stream(prompt, (chunk) => {
    if (chunk.text) {
      buffer.addToken(chunk.text);
      emitToDashboard('token', {
        provider: providerName,
        text: chunk.text,
        timestamp: new Date().toISOString()
      });
    }

    if (chunk.isFinished) {
      const metrics = buffer.getMetrics(
        modelInfo.inputCost,
        modelInfo.outputCost,
        chunk.usage?.promptTokens || 0
      );

      console.error(`Stream complete. Tokens: ${metrics.totalTokens}, Cost: ${metrics.cost}`);

      emitToDashboard('stream_complete', {
        provider: providerName,
        metrics,
        fullText: buffer.getFullText(),
        timestamp: new Date().toISOString()
      });

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

  return buffer.getFullText();
};
