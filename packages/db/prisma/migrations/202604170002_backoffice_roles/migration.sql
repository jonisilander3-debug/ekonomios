CREATE TYPE "BackofficeRoleKey" AS ENUM (
  'CUSTOMER_SUPPORT',
  'ACCOUNTANT',
  'AUDITOR',
  'CORPORATE_LAWYER',
  'TAX_LAWYER',
  'ADMIN_SUPPORT'
);

CREATE TYPE "BackofficePermissionKey" AS ENUM (
  'VIEW_COMPANY_PROFILE',
  'VIEW_COMPANY_FINANCE',
  'VIEW_COMPANY_PAYROLL',
  'VIEW_COMPANY_DOCUMENTS',
  'REPLY_CUSTOMER_MESSAGES',
  'CREATE_INTERNAL_COMMENT',
  'ASSIGN_CASE',
  'ESCALATE_CASE',
  'RESOLVE_CASE',
  'REVIEW_BOOKKEEPING',
  'APPROVE_BOOKKEEPING',
  'REVIEW_YEAR_END',
  'PERFORM_AUDIT_ACTIONS',
  'HANDLE_CORPORATE_LEGAL',
  'HANDLE_TAX_LEGAL',
  'MANAGE_SUBSCRIPTIONS',
  'VIEW_SYSTEM_INCIDENTS',
  'MANAGE_PERMISSIONS',
  'IMPERSONATE_COMPANY_VIEW',
  'ACCESS_ADMIN_TOOLS'
);

CREATE TYPE "BackofficePermissionOverrideMode" AS ENUM ('GRANT', 'DENY');

CREATE TABLE "BackofficeUserRoleAssignment" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "roleKey" "BackofficeRoleKey" NOT NULL,
  "isPrimary" BOOLEAN NOT NULL DEFAULT false,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "department" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "BackofficeUserRoleAssignment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BackofficePermissionOverride" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "permissionKey" "BackofficePermissionKey" NOT NULL,
  "mode" "BackofficePermissionOverrideMode" NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "BackofficePermissionOverride_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "BackofficeUserRoleAssignment_userId_roleKey_key"
  ON "BackofficeUserRoleAssignment"("userId", "roleKey");

CREATE INDEX "BackofficeUserRoleAssignment_userId_isActive_idx"
  ON "BackofficeUserRoleAssignment"("userId", "isActive");

CREATE UNIQUE INDEX "BackofficePermissionOverride_userId_permissionKey_mode_key"
  ON "BackofficePermissionOverride"("userId", "permissionKey", "mode");

CREATE INDEX "BackofficePermissionOverride_userId_isActive_idx"
  ON "BackofficePermissionOverride"("userId", "isActive");

ALTER TABLE "BackofficeUserRoleAssignment"
  ADD CONSTRAINT "BackofficeUserRoleAssignment_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "BackofficePermissionOverride"
  ADD CONSTRAINT "BackofficePermissionOverride_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
