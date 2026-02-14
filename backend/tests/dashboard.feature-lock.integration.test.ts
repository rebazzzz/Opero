import jwt from "jsonwebtoken";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

let app: import("express").Express;
let prisma: import("@prisma/client").PrismaClient;

const testOrgLockedId = "org_dash_lock_test";
const testUserLockedId = "usr_dash_lock_test";

describe("GET /dashboard/summary feature lock", () => {
  beforeAll(async () => {
    process.env.JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET ?? "12345678901234567890123456789012";
    process.env.JWT_REFRESH_SECRET =
      process.env.JWT_REFRESH_SECRET ?? "abcdefghijklmnopqrstuvwxyz123456";

    const appModule = await import("../src/app.js");
    const prismaModule = await import("../src/config/prisma.js");
    app = appModule.app;
    prisma = prismaModule.prisma;

    await prisma.organization.deleteMany({
      where: { id: testOrgLockedId }
    });

    await prisma.organization.create({
      data: {
        id: testOrgLockedId,
        name: "Dashboard Locked Org",
        plan: "FREE"
      }
    });

    await prisma.user.create({
      data: {
        id: testUserLockedId,
        email: "dash.locked@example.com",
        passwordHash: "hash-locked",
        role: "ADMIN",
        organizationId: testOrgLockedId
      }
    });

    await prisma.featureModule.create({
      data: {
        organizationId: testOrgLockedId,
        name: "ANALYTICS",
        enabled: false
      }
    });
  });

  afterAll(async () => {
    await prisma.organization.deleteMany({
      where: { id: testOrgLockedId }
    });
  });

  it("returns 403 with plan-upgrade message when analytics is disabled", async () => {
    const token = jwt.sign(
      {
        sub: testUserLockedId,
        organizationId: testOrgLockedId,
        role: "ADMIN",
        sessionId: "sess_dash_lock",
        type: "access"
      },
      process.env.JWT_ACCESS_SECRET!,
      { expiresIn: "15m" }
    );

    const response = await request(app)
      .get("/dashboard/summary")
      .set("Authorization", `Bearer ${token}`)
      .expect(403);

    expect(response.body.success).toBe(false);
    expect(response.body.error?.code).toBe("FEATURE_LOCKED");
    expect(response.body.error?.message).toBe("This feature requires plan upgrade");
  });
});
