-- CreateTable
CREATE TABLE "LLMCall" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modelProvider" TEXT NOT NULL,
    "modelName" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "response" TEXT NOT NULL,
    "tokenCount" INTEGER,
    "costEstimate" REAL,
    "latencyMs" INTEGER,
    "isStreamed" BOOLEAN NOT NULL DEFAULT false,
    "isChained" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'success',
    "errorMessage" TEXT,
    "chainId" TEXT,
    CONSTRAINT "LLMCall_chainId_fkey" FOREIGN KEY ("chainId") REFERENCES "ChainSession" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ChainSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT,
    "steps" TEXT NOT NULL,
    "totalTokens" INTEGER NOT NULL DEFAULT 0,
    "totalCost" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME
);

-- CreateIndex
CREATE UNIQUE INDEX "ChainSession_sessionId_key" ON "ChainSession"("sessionId");
