import jwt from "jsonwebtoken";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const orgId = "org_inv_idem";
const userId = "usr_inv_idem_admin";
const clientId = "cli_inv_idem_1";

let app: import("express").Express;
let prisma: import("@prisma/client").PrismaClient;

const cleanup = async (): Promise<void> => {
  if (!prisma) {
    return;
  }

  await prisma.auditLog.deleteMany({
    where: { organizationId: orgId }
  });
  await prisma.idempotencyKey.deleteMany({
    where: { organizationId: orgId }
  });
  await prisma.invoice.deleteMany({
    where: { organizationId: orgId }
  });
  await prisma.client.deleteMany({
    where: { organizationId: orgId }
  });
  await prisma.organization.deleteMany({
    where: { id: orgId }
  });
};

const makeAccessToken = (): string =>
  jwt.sign(
    {
      sub: userId,
      organizationId: orgId,
      role: "ADMIN",
      sessionId: `sess_${userId}`,
      type: "access"
    },
    process.env.JWT_ACCESS_SECRET!,
    { expiresIn: "15m" }
  );

describe("Invoice idempotency", () => {
  beforeAll(async () => {
    process.env.JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET ?? "12345678901234567890123456789012";
    process.env.JWT_REFRESH_SECRET =
      process.env.JWT_REFRESH_SECRET ?? "abcdefghijklmnopqrstuvwxyz123456";

    const appModule = await import("../src/app.js");
    const prismaModule = await import("../src/config/prisma.js");
    app = appModule.app;
    prisma = prismaModule.prisma;

    await cleanup();

    await prisma.organization.create({
      data: { id: orgId, name: "Invoice Idempotency Org", plan: "ENTERPRISE" }
    });

    await prisma.user.create({
      data: {
        id: userId,
        email: "invoice.idempotency.admin@example.com",
        passwordHash: "x",
        role: "ADMIN",
        organizationId: orgId
      }
    });

    await prisma.featureModule.create({
      data: {
        organizationId: orgId,
        name: "INVOICES",
        enabled: true
      }
    });

    await prisma.client.create({
      data: {
        id: clientId,
        organizationId: orgId,
        name: "Idempotency Client",
        email: "client.idempotency@example.com"
      }
    });
  });

  afterAll(async () => {
    await cleanup();
  });

  it("rejects money-changing invoice write without Idempotency-Key", async () => {
    const token = makeAccessToken();
    const response = await request(app)
      .post("/invoices/drafts")
      .set("Authorization", `Bearer ${token}`)
      .send({
        clientId,
        invoiceNumber: "INV-IDEMP-001",
        currency: "USD",
        subtotal: "100.00",
        tax: "10.00",
        total: "110.00",
        dueDate: "2026-03-01T00:00:00.000Z"
      })
      .expect(400);

    expect(response.body.error.code).toBe("IDEMPOTENCY_KEY_REQUIRED");
  });

  it("replays same response for duplicate Idempotency-Key", async () => {
    const token = makeAccessToken();
    const key = "idem-invoice-draft-1";

    const first = await request(app)
      .post("/invoices/drafts")
      .set("Authorization", `Bearer ${token}`)
      .set("Idempotency-Key", key)
      .send({
        clientId,
        invoiceNumber: "INV-IDEMP-002",
        currency: "USD",
        subtotal: "250.00",
        tax: "25.00",
        total: "275.00",
        dueDate: "2026-03-05T00:00:00.000Z"
      })
      .expect(201);

    const second = await request(app)
      .post("/invoices/drafts")
      .set("Authorization", `Bearer ${token}`)
      .set("Idempotency-Key", key)
      .send({
        clientId,
        invoiceNumber: "INV-IDEMP-002",
        currency: "USD",
        subtotal: "250.00",
        tax: "25.00",
        total: "275.00",
        dueDate: "2026-03-05T00:00:00.000Z"
      })
      .expect(201);

    expect(second.headers["idempotency-replayed"]).toBe("true");
    expect(second.body.data.id).toBe(first.body.data.id);

    const auditEntries = await prisma.auditLog.findMany({
      where: {
        organizationId: orgId,
        entityType: "INVOICE",
        entityId: first.body.data.id,
        action: "INVOICE_DRAFT_CREATED"
      }
    });

    expect(auditEntries).toHaveLength(1);
    expect(auditEntries[0].actorUserId).toBe(userId);
  });
});
