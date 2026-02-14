DO $$
BEGIN
  ALTER TYPE "FeatureModuleName" ADD VALUE IF NOT EXISTS 'NOTIFICATIONS';
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TYPE "NotificationType_new" AS ENUM ('INFO', 'WARNING', 'ALERT');

ALTER TABLE "Notification"
ADD COLUMN "organizationId" TEXT,
ADD COLUMN "title" TEXT;

UPDATE "Notification" n
SET "organizationId" = u."organizationId",
    "title" = LEFT(n."message", 200)
FROM "User" u
WHERE n."userId" = u."id";

ALTER TABLE "Notification"
ALTER COLUMN "organizationId" SET NOT NULL,
ALTER COLUMN "title" SET NOT NULL,
ALTER COLUMN "type" DROP DEFAULT;

ALTER TABLE "Notification"
ALTER COLUMN "type" TYPE "NotificationType_new"
USING (
  CASE
    WHEN "type"::text IN ('SUCCESS', 'ERROR') THEN 'ALERT'::"NotificationType_new"
    ELSE "type"::text::"NotificationType_new"
  END
);

ALTER TABLE "Notification"
ALTER COLUMN "type" SET DEFAULT 'INFO';

DROP TYPE "NotificationType";
ALTER TYPE "NotificationType_new" RENAME TO "NotificationType";

DROP INDEX IF EXISTS "Notification_userId_read_createdAt_idx";
CREATE INDEX "Notification_organizationId_userId_read_createdAt_idx"
ON "Notification" ("organizationId", "userId", "read", "createdAt");

ALTER TABLE "Notification"
ADD CONSTRAINT "Notification_organizationId_fkey"
FOREIGN KEY ("organizationId") REFERENCES "Organization"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
