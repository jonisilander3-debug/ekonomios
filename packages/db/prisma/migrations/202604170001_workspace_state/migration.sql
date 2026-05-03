-- CreateTable
CREATE TABLE "WorkspaceLayoutPreference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "roleKey" TEXT NOT NULL,
    "widgetOrder" JSONB NOT NULL,
    "hiddenWidgets" JSONB NOT NULL,
    "pinnedWidgets" JSONB NOT NULL,
    "widgetSizes" JSONB NOT NULL,
    "density" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkspaceLayoutPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkspaceSessionState" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "roleKey" TEXT NOT NULL,
    "selectedWidgetId" TEXT,
    "windows" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkspaceSessionState_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WorkspaceLayoutPreference_userId_companyId_roleKey_key" ON "WorkspaceLayoutPreference"("userId", "companyId", "roleKey");

-- CreateIndex
CREATE INDEX "WorkspaceLayoutPreference_companyId_roleKey_idx" ON "WorkspaceLayoutPreference"("companyId", "roleKey");

-- CreateIndex
CREATE UNIQUE INDEX "WorkspaceSessionState_userId_companyId_roleKey_key" ON "WorkspaceSessionState"("userId", "companyId", "roleKey");

-- CreateIndex
CREATE INDEX "WorkspaceSessionState_companyId_roleKey_idx" ON "WorkspaceSessionState"("companyId", "roleKey");
