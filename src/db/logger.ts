import { PrismaClient } from '@prisma/client';
import { StreamEvent, EventType } from '../streaming/events.js';

export const prisma = new PrismaClient();

export const logCall = async (data: {
  modelProvider: string;
  modelName: string;
  prompt: string;
  response: string;
  tokenCount?: number;
  costEstimate?: number;
  latencyMs?: number;
  isStreamed?: boolean;
  isChained?: boolean;
  status?: string;
  errorMessage?: string;
  chainId?: string;
}) => {
  try {
    return await prisma.lLMCall.create({
      data
    });
  } catch (error) {
    console.error('Failed to log LLM call to DB:', error);
  }
};

export const createChainSession = async (sessionId?: string) => {
  return await prisma.chainSession.create({
    data: {
      sessionId,
      steps: JSON.stringify([])
    }
  });
};

export const updateChainSession = async (id: string, update: any) => {
  return await prisma.chainSession.update({
    where: { id },
    data: {
      ...update,
      steps: update.steps ? JSON.stringify(update.steps) : undefined
    }
  });
};

export const getHistory = async (limit = 50) => {
  return await prisma.lLMCall.findMany({
    orderBy: { timestamp: 'desc' },
    take: limit,
    include: { chain: true }
  });
};
