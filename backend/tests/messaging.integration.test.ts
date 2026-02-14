import { createServer, type Server as HttpServer } from "node:http";
import jwt from "jsonwebtoken";
import request from "supertest";
import { io as ioClient, type Socket } from "socket.io-client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const orgA = "org_msg_int_a";
const orgB = "org_msg_int_b";
const userA1 = "usr_msg_int_a1";
const userA2 = "usr_msg_int_a2";
const userB1 = "usr_msg_int_b1";
const userB2 = "usr_msg_int_b2";
const threadA = "thr_msg_int_a";
const threadB = "thr_msg_int_b";

let server: HttpServer;
let baseUrl: string;
let app: import("express").Express;
let prisma: import("@prisma/client").PrismaClient;
let initializeMessagingSocket: (httpServer: HttpServer) => import("socket.io").Server;
let closeMessagingSocket: () => Promise<void>;

const cleanup = async (): Promise<void> => {
  await prisma.message.deleteMany({
    where: {
      OR: [
        { sender: { organizationId: { in: [orgA, orgB] } } },
        { thread: { organizationId: { in: [orgA, orgB] } } }
      ]
    }
  });
  await prisma.messageThread.deleteMany({
    where: { organizationId: { in: [orgA, orgB] } }
  });
  await prisma.organization.deleteMany({
    where: { id: { in: [orgA, orgB] } }
  });
};

const makeAccessToken = (userId: string, organizationId: string, role: "ADMIN" | "MEMBER") => {
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

describe("Messaging routes + socket", () => {
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
        { id: orgA, name: "Messaging Integration A", plan: "ENTERPRISE" },
        { id: orgB, name: "Messaging Integration B", plan: "ENTERPRISE" }
      ]
    });

    await prisma.user.createMany({
      data: [
        { id: userA1, email: "msg.int.a1@example.com", passwordHash: "x", role: "ADMIN", organizationId: orgA },
        { id: userA2, email: "msg.int.a2@example.com", passwordHash: "x", role: "MEMBER", organizationId: orgA },
        { id: userB1, email: "msg.int.b1@example.com", passwordHash: "x", role: "ADMIN", organizationId: orgB },
        { id: userB2, email: "msg.int.b2@example.com", passwordHash: "x", role: "MEMBER", organizationId: orgB }
      ]
    });

    await prisma.featureModule.createMany({
      data: [
        { organizationId: orgA, name: "MESSAGING", enabled: true },
        { organizationId: orgB, name: "MESSAGING", enabled: true }
      ]
    });

    await prisma.messageThread.createMany({
      data: [
        { id: threadA, organizationId: orgA },
        { id: threadB, organizationId: orgB }
      ]
    });

    await prisma.message.createMany({
      data: [
        { id: "msg_int_a_1", threadId: threadA, senderId: userA1, content: "Org A one" },
        { id: "msg_int_b_1", threadId: threadB, senderId: userB1, content: "Org B one" }
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

  it("GET /messages/:threadId returns only messages in caller organization", async () => {
    const tokenA = makeAccessToken(userA1, orgA, "ADMIN");

    const okResponse = await request(baseUrl)
      .get(`/messages/${threadA}`)
      .set("Authorization", `Bearer ${tokenA}`)
      .expect(200);

    expect(okResponse.body.data.id).toBe(threadA);
    expect(okResponse.body.data.messages).toHaveLength(1);
    expect(okResponse.body.data.messages[0].content).toBe("Org A one");

    await request(baseUrl)
      .get(`/messages/${threadB}`)
      .set("Authorization", `Bearer ${tokenA}`)
      .expect(404);
  });

  it("POST /messages creates message and emits socket event in same org", async () => {
    const tokenA = makeAccessToken(userA2, orgA, "MEMBER");

    const socket: Socket = ioClient(baseUrl, {
      auth: { token: tokenA },
      transports: ["websocket"]
    });

    await new Promise<void>((resolve, reject) => {
      socket.on("connect", () => resolve());
      socket.on("connect_error", (error) => reject(error));
    });

    const eventPromise = new Promise<{ message: { content: string; threadId: string; senderId: string } }>(
      (resolve) => {
        socket.once("message:new", (payload) => {
          resolve(payload as { message: { content: string; threadId: string; senderId: string } });
        });
      }
    );

    const postResponse = await request(baseUrl)
      .post("/messages")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ threadId: threadA, content: "Real-time from A" })
      .expect(201);

    expect(postResponse.body.data.content).toBe("Real-time from A");

    const eventPayload = await eventPromise;
    expect(eventPayload.message.content).toBe("Real-time from A");
    expect(eventPayload.message.threadId).toBe(threadA);
    expect(eventPayload.message.senderId).toBe(userA2);

    socket.disconnect();
  });

  it("feature lock disabled returns 403 FEATURE_LOCKED for GET and POST", async () => {
    await prisma.featureModule.update({
      where: {
        organizationId_name: {
          organizationId: orgA,
          name: "MESSAGING"
        }
      },
      data: { enabled: false }
    });

    const tokenA = makeAccessToken(userA1, orgA, "ADMIN");

    const getResponse = await request(baseUrl)
      .get(`/messages/${threadA}`)
      .set("Authorization", `Bearer ${tokenA}`)
      .expect(403);
    expect(getResponse.body.error.code).toBe("FEATURE_LOCKED");

    const postResponse = await request(baseUrl)
      .post("/messages")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ threadId: threadA, content: "blocked" })
      .expect(403);
    expect(postResponse.body.error.code).toBe("FEATURE_LOCKED");
  });
});
