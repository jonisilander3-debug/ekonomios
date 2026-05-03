CREATE TYPE "BackofficeRebalanceJobMode" AS ENUM ('DRY_RUN', 'SUGGEST', 'EXECUTE');
CREATE TYPE "BackofficeRebalanceJobStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED');
CREATE TYPE "BackofficeRebalanceExecutionActionStatus" AS ENUM ('SUGGESTED', 'EXECUTED', 'SKIPPED');
CREATE TYPE "BackofficeMessageLinkTargetType" AS ENUM (
  'COMPANY',
  'CASE',
  'CUSTOMER',
  'PROJECT',
  'INVOICE',
  'VOUCHER',
  'RECEIPT',
  'PAYROLL_RUN',
  'DOCUMENT'
);

ALTER TABLE "BackofficeThreadParticipant" ADD COLUMN "email" TEXT;

CREATE TABLE "BackofficeRebalanceJob" (
  "id" TEXT NOT NULL,
  "companyId" TEXT,
  "roleKey" "BackofficeRoleKey",
  "mode" "BackofficeRebalanceJobMode" NOT NULL,
  "status" "BackofficeRebalanceJobStatus" NOT NULL DEFAULT 'PENDING',
  "triggerSource" TEXT NOT NULL,
  "triggeredByUserId" TEXT,
  "dryRun" BOOLEAN NOT NULL DEFAULT false,
  "analyzedCaseCount" INTEGER NOT NULL DEFAULT 0,
  "suggestionCount" INTEGER NOT NULL DEFAULT 0,
  "executedMoveCount" INTEGER NOT NULL DEFAULT 0,
  "skippedMoveCount" INTEGER NOT NULL DEFAULT 0,
  "warningCount" INTEGER NOT NULL DEFAULT 0,
  "errorMessage" TEXT,
  "metadata" JSONB,
  "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "finishedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "BackofficeRebalanceJob_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BackofficeRebalanceExecution" (
  "id" TEXT NOT NULL,
  "jobId" TEXT NOT NULL,
  "caseExternalId" TEXT NOT NULL,
  "fromUserId" TEXT,
  "toUserId" TEXT,
  "roleKey" "BackofficeRoleKey",
  "status" "BackofficeRebalanceExecutionActionStatus" NOT NULL,
  "reason" TEXT NOT NULL,
  "blocker" TEXT,
  "caseTitle" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "BackofficeRebalanceExecution_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BackofficeThreadObjectLink" (
  "id" TEXT NOT NULL,
  "threadId" TEXT NOT NULL,
  "targetType" "BackofficeMessageLinkTargetType" NOT NULL,
  "targetId" TEXT NOT NULL,
  "label" TEXT,
  "href" TEXT,
  "isPrimary" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "BackofficeThreadObjectLink_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "BackofficeRebalanceJob_status_startedAt_idx" ON "BackofficeRebalanceJob"("status", "startedAt");
CREATE INDEX "BackofficeRebalanceJob_roleKey_startedAt_idx" ON "BackofficeRebalanceJob"("roleKey", "startedAt");
CREATE INDEX "BackofficeRebalanceJob_companyId_startedAt_idx" ON "BackofficeRebalanceJob"("companyId", "startedAt");
CREATE INDEX "BackofficeRebalanceExecution_jobId_createdAt_idx" ON "BackofficeRebalanceExecution"("jobId", "createdAt");
CREATE INDEX "BackofficeRebalanceExecution_caseExternalId_idx" ON "BackofficeRebalanceExecution"("caseExternalId");
CREATE INDEX "BackofficeThreadObjectLink_threadId_isPrimary_idx" ON "BackofficeThreadObjectLink"("threadId", "isPrimary");
CREATE INDEX "BackofficeThreadObjectLink_targetType_targetId_idx" ON "BackofficeThreadObjectLink"("targetType", "targetId");

ALTER TABLE "BackofficeRebalanceJob"
ADD CONSTRAINT "BackofficeRebalanceJob_companyId_fkey"
FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "BackofficeRebalanceJob"
ADD CONSTRAINT "BackofficeRebalanceJob_triggeredByUserId_fkey"
FOREIGN KEY ("triggeredByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "BackofficeRebalanceExecution"
ADD CONSTRAINT "BackofficeRebalanceExecution_jobId_fkey"
FOREIGN KEY ("jobId") REFERENCES "BackofficeRebalanceJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "BackofficeRebalanceExecution"
ADD CONSTRAINT "BackofficeRebalanceExecution_fromUserId_fkey"
FOREIGN KEY ("fromUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "BackofficeRebalanceExecution"
ADD CONSTRAINT "BackofficeRebalanceExecution_toUserId_fkey"
FOREIGN KEY ("toUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "BackofficeThreadObjectLink"
ADD CONSTRAINT "BackofficeThreadObjectLink_threadId_fkey"
FOREIGN KEY ("threadId") REFERENCES "BackofficeThread"("id") ON DELETE CASCADE ON UPDATE CASCADE;
