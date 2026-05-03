CREATE TYPE "BackofficeSlaScopeType" AS ENUM (
  'SYSTEM_DEFAULT',
  'ROLE',
  'CASE_TYPE',
  'QUEUE_TYPE',
  'COMPANY',
  'CASE'
);

CREATE TYPE "BackofficeAvailabilityStatus" AS ENUM (
  'AVAILABLE',
  'LIMITED',
  'OFFLINE'
);

CREATE TYPE "BackofficeThreadStatus" AS ENUM (
  'OPEN',
  'WAITING_FOR_CUSTOMER',
  'WAITING_FOR_BACKOFFICE',
  'RESOLVED'
);

CREATE TYPE "BackofficeThreadParticipantType" AS ENUM (
  'INTERNAL_USER',
  'CUSTOMER_CONTACT',
  'SYSTEM'
);

CREATE TYPE "BackofficeMessageVisibility" AS ENUM (
  'INTERNAL',
  'EXTERNAL'
);

CREATE TYPE "BackofficeMessageDirection" AS ENUM (
  'INBOUND',
  'OUTBOUND',
  'NOTE'
);

CREATE TYPE "BackofficeMessageStatus" AS ENUM (
  'UNREAD',
  'READ',
  'SENT'
);

CREATE TYPE "BackofficeRebalanceMode" AS ENUM (
  'SUGGEST',
  'AUTO'
);

CREATE TABLE "BackofficeSlaPolicy" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "scopeType" "BackofficeSlaScopeType" NOT NULL,
  "roleKey" "BackofficeRoleKey",
  "caseType" TEXT,
  "queueType" TEXT,
  "companyId" TEXT,
  "caseExternalId" TEXT,
  "serviceTier" TEXT,
  "firstResponseTargetHours" INTEGER NOT NULL,
  "resolutionTargetHours" INTEGER NOT NULL,
  "warningThresholdHours" INTEGER NOT NULL,
  "pauseOnWaitingForCustomer" BOOLEAN NOT NULL DEFAULT true,
  "priorityMultipliers" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "BackofficeSlaPolicy_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BackofficeCapacityProfile" (
  "id" TEXT NOT NULL,
  "userId" TEXT,
  "roleKey" "BackofficeRoleKey",
  "teamKey" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "availabilityStatus" "BackofficeAvailabilityStatus" NOT NULL DEFAULT 'AVAILABLE',
  "dailyCapacityPoints" INTEGER NOT NULL,
  "weeklyCapacityPoints" INTEGER NOT NULL,
  "maxParallelCases" INTEGER NOT NULL,
  "preferredQueueTypes" JSONB,
  "specialistCaseTypes" JSONB,
  "workTypeWeights" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "BackofficeCapacityProfile_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BackofficeThread" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "caseId" TEXT,
  "title" TEXT NOT NULL,
  "status" "BackofficeThreadStatus" NOT NULL DEFAULT 'OPEN',
  "priority" TEXT NOT NULL,
  "sourceType" TEXT,
  "sourceId" TEXT,
  "lastMessageAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "BackofficeThread_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BackofficeThreadParticipant" (
  "id" TEXT NOT NULL,
  "threadId" TEXT NOT NULL,
  "userId" TEXT,
  "roleKey" "BackofficeRoleKey",
  "participantType" "BackofficeThreadParticipantType" NOT NULL,
  "displayName" TEXT NOT NULL,
  "lastReadAt" TIMESTAMP(3),
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "BackofficeThreadParticipant_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BackofficeMessage" (
  "id" TEXT NOT NULL,
  "threadId" TEXT NOT NULL,
  "senderUserId" TEXT,
  "senderRoleKey" "BackofficeRoleKey",
  "visibility" "BackofficeMessageVisibility" NOT NULL,
  "direction" "BackofficeMessageDirection" NOT NULL,
  "status" "BackofficeMessageStatus" NOT NULL DEFAULT 'UNREAD',
  "body" TEXT NOT NULL,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "BackofficeMessage_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BackofficeRebalancePolicy" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "mode" "BackofficeRebalanceMode" NOT NULL DEFAULT 'SUGGEST',
  "roleKey" "BackofficeRoleKey",
  "overloadThreshold" DECIMAL(10,2) NOT NULL,
  "underloadThreshold" DECIMAL(10,2) NOT NULL,
  "maxMovesPerRun" INTEGER NOT NULL DEFAULT 3,
  "excludeWaitingForCustomer" BOOLEAN NOT NULL DEFAULT true,
  "rebalanceCooldownHours" INTEGER NOT NULL DEFAULT 8,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "BackofficeRebalancePolicy_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "BackofficeSlaPolicy_scopeType_isActive_idx" ON "BackofficeSlaPolicy"("scopeType", "isActive");
CREATE INDEX "BackofficeSlaPolicy_roleKey_isActive_idx" ON "BackofficeSlaPolicy"("roleKey", "isActive");
CREATE INDEX "BackofficeSlaPolicy_caseType_isActive_idx" ON "BackofficeSlaPolicy"("caseType", "isActive");
CREATE INDEX "BackofficeSlaPolicy_queueType_isActive_idx" ON "BackofficeSlaPolicy"("queueType", "isActive");
CREATE INDEX "BackofficeSlaPolicy_companyId_isActive_idx" ON "BackofficeSlaPolicy"("companyId", "isActive");

CREATE INDEX "BackofficeCapacityProfile_userId_isActive_idx" ON "BackofficeCapacityProfile"("userId", "isActive");
CREATE INDEX "BackofficeCapacityProfile_roleKey_isActive_idx" ON "BackofficeCapacityProfile"("roleKey", "isActive");
CREATE INDEX "BackofficeCapacityProfile_teamKey_isActive_idx" ON "BackofficeCapacityProfile"("teamKey", "isActive");

CREATE INDEX "BackofficeThread_companyId_status_idx" ON "BackofficeThread"("companyId", "status");
CREATE INDEX "BackofficeThread_caseId_idx" ON "BackofficeThread"("caseId");
CREATE INDEX "BackofficeThreadParticipant_threadId_isActive_idx" ON "BackofficeThreadParticipant"("threadId", "isActive");
CREATE INDEX "BackofficeThreadParticipant_userId_isActive_idx" ON "BackofficeThreadParticipant"("userId", "isActive");
CREATE INDEX "BackofficeMessage_threadId_createdAt_idx" ON "BackofficeMessage"("threadId", "createdAt");
CREATE INDEX "BackofficeMessage_senderUserId_idx" ON "BackofficeMessage"("senderUserId");
CREATE INDEX "BackofficeRebalancePolicy_roleKey_isActive_idx" ON "BackofficeRebalancePolicy"("roleKey", "isActive");

ALTER TABLE "BackofficeSlaPolicy"
  ADD CONSTRAINT "BackofficeSlaPolicy_companyId_fkey"
  FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "BackofficeCapacityProfile"
  ADD CONSTRAINT "BackofficeCapacityProfile_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "BackofficeThread"
  ADD CONSTRAINT "BackofficeThread_companyId_fkey"
  FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "BackofficeThreadParticipant"
  ADD CONSTRAINT "BackofficeThreadParticipant_threadId_fkey"
  FOREIGN KEY ("threadId") REFERENCES "BackofficeThread"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "BackofficeThreadParticipant"
  ADD CONSTRAINT "BackofficeThreadParticipant_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "BackofficeMessage"
  ADD CONSTRAINT "BackofficeMessage_threadId_fkey"
  FOREIGN KEY ("threadId") REFERENCES "BackofficeThread"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "BackofficeMessage"
  ADD CONSTRAINT "BackofficeMessage_senderUserId_fkey"
  FOREIGN KEY ("senderUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
