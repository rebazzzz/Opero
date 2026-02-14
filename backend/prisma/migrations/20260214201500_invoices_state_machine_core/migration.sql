CREATE TYPE "InvoiceStatus_new" AS ENUM ('DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED');

ALTER TABLE "Project" ADD CONSTRAINT "Project_id_organizationId_key" UNIQUE ("id", "organizationId");

ALTER TABLE "Invoice" DROP CONSTRAINT "Invoice_clientId_fkey";
ALTER TABLE "Invoice" DROP CONSTRAINT "Invoice_projectId_fkey";

ALTER TABLE "Invoice"
ADD COLUMN "invoiceNumber" TEXT,
ADD COLUMN "currency" TEXT,
ADD COLUMN "subtotal" DECIMAL(12,2),
ADD COLUMN "tax" DECIMAL(12,2),
ADD COLUMN "total" DECIMAL(12,2),
ADD COLUMN "issuedAt" TIMESTAMP(3),
ADD COLUMN "paidAt" TIMESTAMP(3);

UPDATE "Invoice"
SET
  "currency" = 'USD',
  "subtotal" = "amount",
  "tax" = 0,
  "total" = "amount";

WITH numbered AS (
  SELECT
    "id",
    "organizationId",
    ROW_NUMBER() OVER (PARTITION BY "organizationId" ORDER BY "createdAt", "id") AS "rn"
  FROM "Invoice"
)
UPDATE "Invoice" AS i
SET "invoiceNumber" = 'INV-' || LPAD(numbered."rn"::TEXT, 6, '0')
FROM numbered
WHERE i."id" = numbered."id"
  AND i."organizationId" = numbered."organizationId";

ALTER TABLE "Invoice"
ALTER COLUMN "invoiceNumber" SET NOT NULL,
ALTER COLUMN "currency" SET NOT NULL,
ALTER COLUMN "subtotal" SET NOT NULL,
ALTER COLUMN "tax" SET NOT NULL,
ALTER COLUMN "total" SET NOT NULL,
ALTER COLUMN "projectId" DROP NOT NULL,
ALTER COLUMN "status" DROP DEFAULT;

ALTER TABLE "Invoice"
ALTER COLUMN "status" TYPE "InvoiceStatus_new"
USING (
  CASE
    WHEN "status" = 'VOID' THEN 'CANCELLED'::"InvoiceStatus_new"
    ELSE "status"::text::"InvoiceStatus_new"
  END
);

ALTER TABLE "Invoice"
ALTER COLUMN "status" SET DEFAULT 'DRAFT';

DROP TYPE "InvoiceStatus";
ALTER TYPE "InvoiceStatus_new" RENAME TO "InvoiceStatus";

ALTER TABLE "Invoice" DROP COLUMN "amount";

DROP INDEX IF EXISTS "Invoice_organizationId_status_dueDate_idx";
DROP INDEX IF EXISTS "Invoice_clientId_idx";
DROP INDEX IF EXISTS "Invoice_projectId_idx";

CREATE UNIQUE INDEX "Invoice_organizationId_invoiceNumber_key" ON "Invoice"("organizationId", "invoiceNumber");
CREATE INDEX "Invoice_organizationId_clientId_idx" ON "Invoice"("organizationId", "clientId");
CREATE INDEX "Invoice_organizationId_status_idx" ON "Invoice"("organizationId", "status");

ALTER TABLE "Invoice"
ADD CONSTRAINT "Invoice_clientId_organizationId_fkey"
FOREIGN KEY ("clientId", "organizationId") REFERENCES "Client"("id", "organizationId")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Invoice"
ADD CONSTRAINT "Invoice_projectId_organizationId_fkey"
FOREIGN KEY ("projectId", "organizationId") REFERENCES "Project"("id", "organizationId")
ON DELETE RESTRICT ON UPDATE CASCADE;
