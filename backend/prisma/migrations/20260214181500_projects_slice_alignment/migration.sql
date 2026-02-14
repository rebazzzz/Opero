CREATE TYPE "ProjectStatus_new" AS ENUM ('ACTIVE', 'COMPLETED', 'ARCHIVED');

ALTER TABLE "Project"
ADD COLUMN "description" TEXT;

ALTER TABLE "Project"
ALTER COLUMN "budget" DROP NOT NULL;

ALTER TABLE "Project"
ALTER COLUMN "status" DROP DEFAULT;

ALTER TABLE "Project"
ALTER COLUMN "status" TYPE "ProjectStatus_new"
USING (
  CASE
    WHEN "status" = 'COMPLETED' THEN 'COMPLETED'::"ProjectStatus_new"
    WHEN "status" IN ('CANCELLED', 'ON_HOLD') THEN 'ARCHIVED'::"ProjectStatus_new"
    ELSE 'ACTIVE'::"ProjectStatus_new"
  END
);

ALTER TABLE "Project"
ALTER COLUMN "status" SET DEFAULT 'ACTIVE';

ALTER TABLE "Project"
DROP COLUMN "progress",
DROP COLUMN "deadline";

DROP TYPE "ProjectStatus";
ALTER TYPE "ProjectStatus_new" RENAME TO "ProjectStatus";

DROP INDEX IF EXISTS "Project_clientId_idx";
CREATE INDEX "Project_organizationId_clientId_idx" ON "Project"("organizationId", "clientId");
