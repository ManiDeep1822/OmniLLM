export enum EventType {
  TOKEN = 'token',
  STREAM_COMPLETE = 'stream_complete',
  ERROR = 'error',
  METRICS = 'metrics',
  CHAIN_STEP = 'chain_step',
  FALLBACK = 'fallback'
}

export interface StreamEvent {
  type: EventType;
  provider: string;
  model: string;
  timestamp: string;
  data: any;
}

export interface TokenData {
  text: string;
  index: number;
}

export interface MetricsData {
  timeToFirstToken: number;
  tokensPerSecond: number;
  totalTokens: number;
  totalTime: number;
  cost: number;
}
