import jwt from "jsonwebtoken";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const orgA = "org_admin_a";
const orgB = "org_admin_b";
const adminA = "usr_admin_a";
const memberA = "usr_member_a";
const adminB = "usr_admin_b";

let app: import("express").Express;
let prisma: import("@prisma/client").PrismaClient;

const cleanup = async (): Promise<void> => {
  if (!prisma) {
    return;
  }

  await prisma.auditLog.deleteMany({
    where: { organizationId: { in: [orgA, orgB] } }
  });
  await prisma.organization.deleteMany({
    where: { id: { in: [orgA, orgB] } }
  });
};

const makeAccessToken = (userId: string, organizationId: string, role: "ADMIN" | "MEMBER"): string => {
  return jwt.sign(
    {
      sub: userId,
      organizationId,
      role,
      sessionId: `sess_${userId}`,
      type: "access"
    },
    process.env.JWT_ACCESS_SECRET!,
    { expiresIn: "15m" }
  );
};

describe("Admin role + feature audit", () => {
  beforeAll(async () => {
    process.env.JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET ?? "12345678901234567890123456789012";
    process.env.JWT_REFRESH_SECRET =
      process.env.JWT_REFRESH_SECRET ?? "abcdefghijklmnopqrstuvwxyz123456";

    const appModule = await import("../src/app.js");
    const prismaModule = await import("../src/config/prisma.js");
    app = appModule.app;
    prisma = prismaModule.prisma;

    await cleanup();

    await prisma.organization.createMany({
      data: [
        { id: orgA, name: "Admin Org A", plan: "ENTERPRISE" },
        { id: orgB, name: "Admin Org B", plan: "ENTERPRISE" }
      ]
    });

    await prisma.user.createMany({
      data: [
        { id: adminA, email: "admin.a@example.com", passwordHash: "x", role: "ADMIN", organizationId: orgA },
        { id: memberA, email: "member.a@example.com", passwordHash: "x", role: "MEMBER", organizationId: orgA },
        { id: adminB, email: "admin.b@example.com", passwordHash: "x", role: "ADMIN", organizationId: orgB }
      ]
    });

    await prisma.featureModule.createMany({
      data: [
        { organizationId: orgA, name: "ANALYTICS", enabled: true },
        { organizationId: orgB, name: "ANALYTICS", enabled: false }
      ]
    });
  });

  afterAll(async () => {
    await cleanup();
  });

  it("PATCH /admin/users/:userId/role updates role and writes USER_ROLE_CHANGED audit", async () => {
    const token = makeAccessToken(adminA, orgA, "ADMIN");

    const response = await request(app)
      .patch(`/admin/users/${memberA}/role`)
      .set("Authorization", `Bearer ${token}`)
      .send({ role: "CLIENT" })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.id).toBe(memberA);
    expect(response.body.data.role).toBe("CLIENT");

    const log = await prisma.auditLog.findFirst({
      where: {
        organizationId: orgA,
        action: "USER_ROLE_CHANGED",
        entityType: "USER",
        entityId: memberA
      },
      orderBy: { createdAt: "desc" }
    });

    expect(log).not.toBeNull();
    expect(log?.actorUserId).toBe(adminA);
  });

  it("PATCH /admin/features/:moduleName updates feature module and writes FEATURE_MODULE_TOGGLED audit", async () => {
    const token = makeAccessToken(adminA, orgA, "ADMIN");

    const response = await request(app)
      .patch("/admin/features/ANALYTICS")
      .set("Authorization", `Bearer ${token}`)
      .send({ enabled: false })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.organizationId).toBe(orgA);
    expect(response.body.data.name).toBe("ANALYTICS");
    expect(response.body.data.enabled).toBe(false);

    const log = await prisma.auditLog.findFirst({
      where: {
        organizationId: orgA,
        action: "FEATURE_MODULE_TOGGLED",
        entityType: "FEATURE_MODULE"
      },
      orderBy: { createdAt: "desc" }
    });

    expect(log).not.toBeNull();
    expect(log?.actorUserId).toBe(adminA);
  });

  it("GET /admin/audit-logs is tenant-scoped and supports filtering", async () => {
    const token = makeAccessToken(adminA, orgA, "ADMIN");

    const response = await request(app)
      .get("/admin/audit-logs?action=FEATURE_MODULE_TOGGLED&page=1&limit=10")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data.items)).toBe(true);
    expect(response.body.data.pagination.page).toBe(1);

    for (const item of response.body.data.items as Array<{ organizationId: string; action: string }>) {
      expect(item.organizationId).toBe(orgA);
      expect(item.action).toBe("FEATURE_MODULE_TOGGLED");
    }
  });

  it("cannot change role for user in another organization", async () => {
    const token = makeAccessToken(adminA, orgA, "ADMIN");

    await request(app)
      .patch(`/admin/users/${adminB}/role`)
      .set("Authorization", `Bearer ${token}`)
      .send({ role: "MEMBER" })
      .expect(404);
  });

  it("non-admin receives 403", async () => {
    const memberToken = makeAccessToken(memberA, orgA, "MEMBER");

    const response = await request(app)
      .patch("/admin/features/ANALYTICS")
      .set("Authorization", `Bearer ${memberToken}`)
      .send({ enabled: true })
      .expect(403);

    expect(response.body.error.code).toBe("FORBIDDEN");
  });
});
