CREATE OR REPLACE FUNCTION "prevent_paid_invoice_frozen_fields_update"()
RETURNS TRIGGER AS $$
BEGIN
  IF (OLD."status" = 'PAID' OR NEW."status" = 'PAID') AND (
    NEW."invoiceNumber" IS DISTINCT FROM OLD."invoiceNumber"
    OR NEW."currency" IS DISTINCT FROM OLD."currency"
    OR NEW."subtotal" IS DISTINCT FROM OLD."subtotal"
    OR NEW."tax" IS DISTINCT FROM OLD."tax"
    OR NEW."total" IS DISTINCT FROM OLD."total"
    OR NEW."clientId" IS DISTINCT FROM OLD."clientId"
    OR NEW."projectId" IS DISTINCT FROM OLD."projectId"
    OR NEW."dueDate" IS DISTINCT FROM OLD."dueDate"
  ) THEN
    RAISE EXCEPTION 'PAID invoices have immutable financial identity fields';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION "enforce_invoice_project_client_consistency"()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW."projectId" IS NULL THEN
    RETURN NEW;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM "Project" p
    WHERE p."id" = NEW."projectId"
      AND p."organizationId" = NEW."organizationId"
      AND p."clientId" = NEW."clientId"
  ) THEN
    RAISE EXCEPTION 'Invoice project must belong to the same client and organization';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS "Invoice_project_client_consistency_trigger" ON "Invoice";

CREATE TRIGGER "Invoice_project_client_consistency_trigger"
BEFORE INSERT OR UPDATE OF "organizationId", "clientId", "projectId"
ON "Invoice"
FOR EACH ROW
EXECUTE FUNCTION "enforce_invoice_project_client_consistency"();
