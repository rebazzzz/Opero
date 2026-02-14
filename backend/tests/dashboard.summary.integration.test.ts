import jwt from "jsonwebtoken";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

let app: import("express").Express;
let prisma: import("@prisma/client").PrismaClient;

const testOrgAId = "org_dash_test_a";
const testOrgBId = "org_dash_test_b";
const userAId = "usr_dash_test_a";
const userBId = "usr_dash_test_b";

describe("GET /dashboard/summary", () => {
  beforeAll(async () => {
    process.env.JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET ?? "12345678901234567890123456789012";
    process.env.JWT_REFRESH_SECRET =
      process.env.JWT_REFRESH_SECRET ?? "abcdefghijklmnopqrstuvwxyz123456";

    const appModule = await import("../src/app.js");
    const prismaModule = await import("../src/config/prisma.js");
    app = appModule.app;
    prisma = prismaModule.prisma;

    await prisma.organization.deleteMany({
      where: { id: { in: [testOrgAId, testOrgBId] } }
    });

    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 15);

    await prisma.organization.createMany({
      data: [
        { id: testOrgAId, name: "Dashboard Test Org A", plan: "ENTERPRISE" },
        { id: testOrgBId, name: "Dashboard Test Org B", plan: "ENTERPRISE" }
      ]
    });

    await prisma.user.createMany({
      data: [
        {
          id: userAId,
          email: "dash.a@example.com",
          passwordHash: "hash-a",
          role: "ADMIN",
          organizationId: testOrgAId
        },
        {
          id: userBId,
          email: "dash.b@example.com",
          passwordHash: "hash-b",
          role: "ADMIN",
          organizationId: testOrgBId
        }
      ]
    });

    await prisma.featureModule.createMany({
      data: [
        { organizationId: testOrgAId, name: "ANALYTICS", enabled: true },
        { organizationId: testOrgBId, name: "ANALYTICS", enabled: true }
      ]
    });

    await prisma.client.createMany({
      data: [
        {
          id: "cli_dash_a_1",
          organizationId: testOrgAId,
          name: "Org A Client 1",
          email: "a1-client@example.com",
          status: "ACTIVE"
        },
        {
          id: "cli_dash_a_2",
          organizationId: testOrgAId,
          name: "Org A Client 2",
          email: "a2-client@example.com",
          status: "ACTIVE"
        },
        {
          id: "cli_dash_b_1",
          organizationId: testOrgBId,
          name: "Org B Client 1",
          email: "b1-client@example.com",
          status: "ACTIVE"
        }
      ]
    });

    await prisma.project.createMany({
      data: [
        {
          id: "prj_dash_a_1",
          organizationId: testOrgAId,
          clientId: "cli_dash_a_1",
          name: "Org A Project Active",
          status: "ACTIVE"
        },
        {
          id: "prj_dash_a_2",
          organizationId: testOrgAId,
          clientId: "cli_dash_a_1",
          name: "Org A Project Completed",
          status: "COMPLETED"
        },
        {
          id: "prj_dash_a_3",
          organizationId: testOrgAId,
          clientId: "cli_dash_a_2",
          name: "Org A Project Archived",
          status: "ARCHIVED"
        },
        {
          id: "prj_dash_b_1",
          organizationId: testOrgBId,
          clientId: "cli_dash_b_1",
          name: "Org B Project",
          status: "ACTIVE"
        }
      ]
    });

    await prisma.invoice.createMany({
      data: [
        {
          id: "inv_dash_a_1",
          organizationId: testOrgAId,
          clientId: "cli_dash_a_1",
          projectId: "prj_dash_a_1",
          invoiceNumber: "INV-DASH-A-1",
          status: "PAID",
          currency: "USD",
          subtotal: 100,
          tax: 10,
          total: 110,
          dueDate: now,
          createdAt: now
        },
        {
          id: "inv_dash_a_2",
          organizationId: testOrgAId,
          clientId: "cli_dash_a_1",
          projectId: "prj_dash_a_1",
          invoiceNumber: "INV-DASH-A-2",
          status: "SENT",
          currency: "USD",
          subtotal: 200,
          tax: 20,
          total: 220,
          dueDate: now,
          createdAt: now
        },
        {
          id: "inv_dash_a_3",
          organizationId: testOrgAId,
          clientId: "cli_dash_a_2",
          projectId: "prj_dash_a_3",
          invoiceNumber: "INV-DASH-A-3",
          status: "CANCELLED",
          currency: "USD",
          subtotal: 300,
          tax: 30,
          total: 330,
          dueDate: now,
          createdAt: lastMonth
        },
        {
          id: "inv_dash_b_1",
          organizationId: testOrgBId,
          clientId: "cli_dash_b_1",
          projectId: "prj_dash_b_1",
          invoiceNumber: "INV-DASH-B-1",
          status: "SENT",
          currency: "USD",
          subtotal: 500,
          tax: 50,
          total: 550,
          dueDate: now,
          createdAt: now
        }
      ]
    });

    await prisma.notification.createMany({
      data: [
        {
          id: "ntf_dash_a_1",
          userId: userAId,
          organizationId: testOrgAId,
          type: "INFO",
          title: "Unread A1",
          message: "Unread A1",
          read: false
        },
        {
          id: "ntf_dash_a_2",
          userId: userAId,
          organizationId: testOrgAId,
          type: "INFO",
          title: "Read A2",
          message: "Read A2",
          read: true
        },
        {
          id: "ntf_dash_b_1",
          userId: userBId,
          organizationId: testOrgBId,
          type: "INFO",
          title: "Unread B1",
          message: "Unread B1",
          read: false
        }
      ]
    });
  });

  afterAll(async () => {
    await prisma.organization.deleteMany({
      where: { id: { in: [testOrgAId, testOrgBId] } }
    });
  });

  it("returns tenant-scoped summary metrics", async () => {
    const token = jwt.sign(
      {
        sub: userAId,
        organizationId: testOrgAId,
        role: "ADMIN",
        sessionId: "sess_dash_a",
        type: "access"
      },
      process.env.JWT_ACCESS_SECRET!,
      { expiresIn: "15m" }
    );

    const response = await request(app)
      .get("/dashboard/summary")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toEqual({
      totalProjects: 3,
      activeProjects: 2,
      totalClients: 2,
      unpaidInvoices: 2,
      revenueThisMonth: 330,
      unreadNotifications: 1
    });
  });
});
