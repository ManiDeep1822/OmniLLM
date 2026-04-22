export class StreamBuffer {
  private tokens: string[] = [];
  private startTime: number;
  private firstTokenTime: number | null = null;
  private chunkCount: number = 0;

  constructor() {
    this.startTime = Date.now();
  }

  addToken(text: string) {
    if (this.firstTokenTime === null && text.length > 0) {
      this.firstTokenTime = Date.now();
    }
    this.tokens.push(text);
    this.chunkCount++;
  }

  getMetrics(costPerMillionInput: number, costPerMillionOutput: number, inputTokens: number, completionTokens?: number) {
    const now = Date.now();
    const totalTime = (now - this.startTime) / 1000;
    const timeToFirstToken = this.firstTokenTime ? (this.firstTokenTime - this.startTime) : 0;
    
    // Prioritize actual completion tokens from provider, fallback to chunk count (heuristic)
    const finalCompletionTokens = completionTokens || this.chunkCount;
    const tokensPerSecond = finalCompletionTokens / (totalTime || 1);
    
    const cost = (inputTokens * costPerMillionInput / 1000000) + 
                 (finalCompletionTokens * costPerMillionOutput / 1000000);

    return {
      timeToFirstToken,
      tokensPerSecond,
      totalTokens: inputTokens + finalCompletionTokens,
      completionTokens: finalCompletionTokens,
      totalTime,
      cost
    };
  }

  getFullText(): string {
    return this.tokens.join('');
  }
}
