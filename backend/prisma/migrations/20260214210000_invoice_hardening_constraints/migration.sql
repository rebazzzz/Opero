ALTER TABLE "Invoice"
ADD CONSTRAINT "Invoice_money_invariant_check"
CHECK (
  "subtotal" >= 0
  AND "tax" >= 0
  AND "total" >= 0
  AND "total" = ("subtotal" + "tax")
);

CREATE INDEX "Invoice_organizationId_invoiceNumber_prefix_idx"
ON "Invoice" ("organizationId", "invoiceNumber" text_pattern_ops);

CREATE OR REPLACE FUNCTION "prevent_paid_invoice_frozen_fields_update"()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD."status" = 'PAID' AND (
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

CREATE TRIGGER "Invoice_paid_frozen_fields_immutable_trigger"
BEFORE UPDATE ON "Invoice"
FOR EACH ROW
EXECUTE FUNCTION "prevent_paid_invoice_frozen_fields_update"();
