import { streamGenerateTool } from './generate.js';
import { multiStepChainTool } from './chain.js';
import { modelComparisonTool } from './compare.js';
import { autoRouterTool } from './router.js';
import { contextChainTool } from './context-chain.js';

export const tools = [
  streamGenerateTool,
  multiStepChainTool,
  modelComparisonTool,
  autoRouterTool,
  contextChainTool
];
