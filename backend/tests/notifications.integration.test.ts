import { createServer, type Server as HttpServer } from "node:http";
import jwt from "jsonwebtoken";
import request from "supertest";
import { io as ioClient, type Socket } from "socket.io-client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const orgA = "org_not_int_a";
const orgB = "org_not_int_b";
const userAAdmin = "usr_not_int_a_admin";
const userAMember = "usr_not_int_a_member";
const userBAdmin = "usr_not_int_b_admin";

let app: import("express").Express;
let prisma: import("@prisma/client").PrismaClient;
let initializeMessagingSocket: (httpServer: HttpServer) => import("socket.io").Server;
let closeMessagingSocket: () => Promise<void>;
let server: HttpServer;
let baseUrl: string;

const cleanup = async (): Promise<void> => {
  await prisma.notification.deleteMany({
    where: { organizationId: { in: [orgA, orgB] } }
  });
  await prisma.organization.deleteMany({
    where: { id: { in: [orgA, orgB] } }
  });
};

const makeAccessToken = (
  userId: string,
  organizationId: string,
  role: "ADMIN" | "MEMBER" | "CLIENT"
): string => {
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

describe("Notifications routes + socket", () => {
  beforeAll(async () => {
    process.env.JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET ?? "12345678901234567890123456789012";
    process.env.JWT_REFRESH_SECRET =
      process.env.JWT_REFRESH_SECRET ?? "abcdefghijklmnopqrstuvwxyz123456";

    const appModule = await import("../src/app.js");
    const prismaModule = await import("../src/config/prisma.js");
    const socketModule = await import("../src/sockets/messaging.socket.js");
    app = appModule.app;
    prisma = prismaModule.prisma;
    initializeMessagingSocket = socketModule.initializeMessagingSocket;
    closeMessagingSocket = socketModule.closeMessagingSocket;

    await cleanup();

    await prisma.organization.createMany({
      data: [
        { id: orgA, name: "Notifications Integration A", plan: "ENTERPRISE" },
        { id: orgB, name: "Notifications Integration B", plan: "ENTERPRISE" }
      ]
    });

    await prisma.user.createMany({
      data: [
        {
          id: userAAdmin,
          email: "not.int.a.admin@example.com",
          passwordHash: "x",
          role: "ADMIN",
          organizationId: orgA
        },
        {
          id: userAMember,
          email: "not.int.a.member@example.com",
          passwordHash: "x",
          role: "MEMBER",
          organizationId: orgA
        },
        {
          id: userBAdmin,
          email: "not.int.b.admin@example.com",
          passwordHash: "x",
          role: "ADMIN",
          organizationId: orgB
        }
      ]
    });

    await prisma.featureModule.createMany({
      data: [
        { organizationId: orgA, name: "NOTIFICATIONS", enabled: true },
        { organizationId: orgB, name: "NOTIFICATIONS", enabled: true }
      ]
    });

    await prisma.notification.createMany({
      data: [
        {
          id: "not_int_a_1",
          userId: userAMember,
          organizationId: orgA,
          type: "INFO",
          title: "A Member One",
          message: "Message A1",
          read: false
        },
        {
          id: "not_int_b_1",
          userId: userBAdmin,
          organizationId: orgB,
          type: "ALERT",
          title: "B Admin One",
          message: "Message B1",
          read: false
        }
      ]
    });

    server = createServer(app);
    initializeMessagingSocket(server);
    await new Promise<void>((resolve) => {
      server.listen(0, () => resolve());
    });
    const address = server.address();
    if (!address || typeof address === "string") {
      throw new Error("Failed to bind test server");
    }
    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  afterAll(async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      });
    });
    await closeMessagingSocket();
    await cleanup();
  });

  it("GET /notifications returns only current user's notifications with unreadOnly filter", async () => {
    const tokenMember = makeAccessToken(userAMember, orgA, "MEMBER");

    const response = await request(baseUrl)
      .get("/notifications?unreadOnly=true")
      .set("Authorization", `Bearer ${tokenMember}`)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].title).toBe("A Member One");
    expect(response.body.data[0].organizationId).toBe(orgA);
  });

  it("POST /notifications creates notification and emits notification:new to target user", async () => {
    const adminToken = makeAccessToken(userAAdmin, orgA, "ADMIN");
    const memberToken = makeAccessToken(userAMember, orgA, "MEMBER");

    const socket: Socket = ioClient(baseUrl, {
      auth: { token: memberToken },
      transports: ["websocket"]
    });

    await new Promise<void>((resolve, reject) => {
      socket.on("connect", () => resolve());
      socket.on("connect_error", (error) => reject(error));
    });

    const eventPromise = new Promise<{ notification: { title: string; userId: string } }>((resolve) => {
      socket.once("notification:new", (payload) => {
        resolve(payload as { notification: { title: string; userId: string } });
      });
    });

    const postResponse = await request(baseUrl)
      .post("/notifications")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        userId: userAMember,
        type: "WARNING",
        title: "Admin warning",
        message: "Please review"
      })
      .expect(201);

    expect(postResponse.body.success).toBe(true);
    expect(postResponse.body.data[0].userId).toBe(userAMember);

    const socketPayload = await eventPromise;
    expect(socketPayload.notification.title).toBe("Admin warning");
    expect(socketPayload.notification.userId).toBe(userAMember);

    socket.disconnect();
  });

  it("PATCH /notifications/:id/read returns updated object and emits notification:read only to target user", async () => {
    const adminTokenA = makeAccessToken(userAAdmin, orgA, "ADMIN");
    const memberTokenA = makeAccessToken(userAMember, orgA, "MEMBER");
    const adminTokenB = makeAccessToken(userBAdmin, orgB, "ADMIN");

    const createResponse = await request(baseUrl)
      .post("/notifications")
      .set("Authorization", `Bearer ${adminTokenA}`)
      .send({
        userId: userAMember,
        type: "INFO",
        title: "Read me",
        message: "mark as read target"
      })
      .expect(201);

    const targetNotificationId = createResponse.body.data[0].id as string;

    const socketA: Socket = ioClient(baseUrl, {
      auth: { token: memberTokenA },
      transports: ["websocket"]
    });
    const socketB: Socket = ioClient(baseUrl, {
      auth: { token: adminTokenB },
      transports: ["websocket"]
    });

    await Promise.all([
      new Promise<void>((resolve, reject) => {
        socketA.on("connect", () => resolve());
        socketA.on("connect_error", (error) => reject(error));
      }),
      new Promise<void>((resolve, reject) => {
        socketB.on("connect", () => resolve());
        socketB.on("connect_error", (error) => reject(error));
      })
    ]);

    const readEventForA = new Promise<{ notification: { id: string; read: boolean } }>((resolve) => {
      socketA.once("notification:read", (payload) => {
        resolve(payload as { notification: { id: string; read: boolean } });
      });
    });

    let leakedToB = false;
    socketB.once("notification:read", () => {
      leakedToB = true;
    });

    const patchResponse = await request(baseUrl)
      .patch(`/notifications/${targetNotificationId}/read`)
      .set("Authorization", `Bearer ${memberTokenA}`)
      .expect(200);

    expect(patchResponse.body.success).toBe(true);
    expect(patchResponse.body.data.id).toBe(targetNotificationId);
    expect(patchResponse.body.data.read).toBe(true);

    const socketPayload = await readEventForA;
    expect(socketPayload.notification.id).toBe(targetNotificationId);
    expect(socketPayload.notification.read).toBe(true);

    await new Promise((resolve) => setTimeout(resolve, 120));
    expect(leakedToB).toBe(false);

    socketA.disconnect();
    socketB.disconnect();
  });

  it("PATCH /notifications/read-all marks unread notifications for current user", async () => {
    const adminTokenA = makeAccessToken(userAAdmin, orgA, "ADMIN");
    const memberTokenA = makeAccessToken(userAMember, orgA, "MEMBER");

    await request(baseUrl)
      .post("/notifications")
      .set("Authorization", `Bearer ${adminTokenA}`)
      .send({
        userId: userAMember,
        type: "WARNING",
        title: "Bulk one",
        message: "one"
      })
      .expect(201);

    await request(baseUrl)
      .post("/notifications")
      .set("Authorization", `Bearer ${adminTokenA}`)
      .send({
        userId: userAMember,
        type: "WARNING",
        title: "Bulk two",
        message: "two"
      })
      .expect(201);

    const response = await request(baseUrl)
      .patch("/notifications/read-all")
      .set("Authorization", `Bearer ${memberTokenA}`)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(typeof response.body.data.updatedCount).toBe("number");
    expect(response.body.data.updatedCount).toBeGreaterThanOrEqual(2);
  });

  it("feature lock disabled returns 403 FEATURE_LOCKED for GET and POST", async () => {
    await prisma.featureModule.update({
      where: {
        organizationId_name: {
          organizationId: orgA,
          name: "NOTIFICATIONS"
        }
      },
      data: { enabled: false }
    });

    const memberToken = makeAccessToken(userAMember, orgA, "MEMBER");
    const adminToken = makeAccessToken(userAAdmin, orgA, "ADMIN");

    const getResponse = await request(baseUrl)
      .get("/notifications")
      .set("Authorization", `Bearer ${memberToken}`)
      .expect(403);
    expect(getResponse.body.error.code).toBe("FEATURE_LOCKED");
    expect(getResponse.body.error.message).toBe("This feature requires plan upgrade");

    const postResponse = await request(baseUrl)
      .post("/notifications")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        userId: userAMember,
        type: "INFO",
        title: "Blocked",
        message: "Should fail"
      })
      .expect(403);
    expect(postResponse.body.error.code).toBe("FEATURE_LOCKED");
    expect(postResponse.body.error.message).toBe("This feature requires plan upgrade");

    const patchOneResponse = await request(baseUrl)
      .patch("/notifications/not_int_a_1/read")
      .set("Authorization", `Bearer ${memberToken}`)
      .expect(403);
    expect(patchOneResponse.body.error.code).toBe("FEATURE_LOCKED");
    expect(patchOneResponse.body.error.message).toBe("This feature requires plan upgrade");

    const patchAllResponse = await request(baseUrl)
      .patch("/notifications/read-all")
      .set("Authorization", `Bearer ${memberToken}`)
      .expect(403);
    expect(patchAllResponse.body.error.code).toBe("FEATURE_LOCKED");
    expect(patchAllResponse.body.error.message).toBe("This feature requires plan upgrade");
  });
});
