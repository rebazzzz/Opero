CREATE TYPE "AuditEntityType" AS ENUM ('INVOICE', 'USER', 'FEATURE_MODULE');
CREATE TYPE "AuditAction" AS ENUM (
  'INVOICE_DRAFT_CREATED',
  'INVOICE_DRAFT_UPDATED',
  'INVOICE_SENT',
  'INVOICE_PAID',
  'INVOICE_CANCELLED',
  'USER_ROLE_CHANGED',
  'FEATURE_MODULE_TOGGLED'
);

CREATE TABLE "AuditLog" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "actorUserId" TEXT,
  "entityType" "AuditEntityType" NOT NULL,
  "entityId" TEXT NOT NULL,
  "action" "AuditAction" NOT NULL,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AuditLog_organizationId_createdAt_idx" ON "AuditLog"("organizationId", "createdAt");
CREATE INDEX "AuditLog_organizationId_entityType_entityId_createdAt_idx"
ON "AuditLog"("organizationId", "entityType", "entityId", "createdAt");
CREATE INDEX "AuditLog_organizationId_action_createdAt_idx"
ON "AuditLog"("organizationId", "action", "createdAt");
