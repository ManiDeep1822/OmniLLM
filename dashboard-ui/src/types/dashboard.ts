/** 
 * OmniLLM Dashboard Type Definitions
 * Centralized for consistency and module resolution stability.
 */

export interface MCPEvent {
  type: 'token' | 'complete' | 'chain_step' | 'error' | 'model_switched';
  text?: string;
  error?: string;
  provider?: string;
  model?: string;
  tokenCount?: number;
  latencyMs?: number;
  data?: {
    step?: number;
    totalSteps?: number;
    prompt?: string;
  };
}

export interface DashboardStats {
  totalTokens: number;
  totalCost: number;
  avgLatency: number;
  totalCalls: number;
  activeSessions: number;
}

export interface ProviderStatus {
  id: string;
  name: string;
  status: 'healthy' | 'unhealthy' | 'degraded' | 'unconfigured';
  latency: number;
  uptime: number;
  history: number[];
}

export interface CallRecord {
  id: string;
  timestamp: string;
  modelProvider: string;
  modelName: string;
  tokenCount: number;
  latencyMs: number;
  costEstimate: number;
}

export interface AnalyticsData {
  date: string;
  cost: number;
  tokens: number;
}
