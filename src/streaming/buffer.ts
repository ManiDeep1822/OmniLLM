export class StreamBuffer {
  private tokens: string[] = [];
  private startTime: number;
  private firstTokenTime: number | null = null;
  private totalTokens: number = 0;

  constructor() {
    this.startTime = Date.now();
  }

  addToken(text: string) {
    if (this.firstTokenTime === null && text.length > 0) {
      this.firstTokenTime = Date.now();
    }
    this.tokens.push(text);
    this.totalTokens++;
  }

  getMetrics(costPerMillionInput: number, costPerMillionOutput: number, inputTokens: number) {
    const now = Date.now();
    const totalTime = (now - this.startTime) / 1000;
    const timeToFirstToken = this.firstTokenTime ? (this.firstTokenTime - this.startTime) : 0;
    const tokensPerSecond = this.totalTokens / totalTime;
    
    const cost = (inputTokens * costPerMillionInput / 1000000) + 
                 (this.totalTokens * costPerMillionOutput / 1000000);

    return {
      timeToFirstToken,
      tokensPerSecond,
      totalTokens: this.totalTokens,
      totalTime,
      cost
    };
  }

  getFullText(): string {
    return this.tokens.join('');
  }
}
