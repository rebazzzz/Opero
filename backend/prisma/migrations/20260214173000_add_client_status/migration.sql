CREATE TYPE "ClientStatus" AS ENUM ('ACTIVE', 'ARCHIVED');

ALTER TABLE "Client"
ADD COLUMN "status" "ClientStatus" NOT NULL DEFAULT 'ACTIVE';

DROP INDEX IF EXISTS "Client_organizationId_name_idx";
CREATE INDEX "Client_organizationId_status_name_idx" ON "Client"("organizationId", "status", "name");
