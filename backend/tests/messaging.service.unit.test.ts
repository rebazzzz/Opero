import { afterAll, beforeAll, describe, expect, it } from "vitest";
let prisma: import("@prisma/client").PrismaClient;
let service: import("../src/services/messaging.service.js").MessagingService;

const orgA = "org_msg_unit_a";
const orgB = "org_msg_unit_b";
const userA1 = "usr_msg_unit_a1";
const userA2 = "usr_msg_unit_a2";
const userB1 = "usr_msg_unit_b1";
const threadA = "thr_msg_unit_a";

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

describe("MessagingService", () => {
  beforeAll(async () => {
    process.env.JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET ?? "12345678901234567890123456789012";
    process.env.JWT_REFRESH_SECRET =
      process.env.JWT_REFRESH_SECRET ?? "abcdefghijklmnopqrstuvwxyz123456";

    const prismaModule = await import("../src/config/prisma.js");
    const serviceModule = await import("../src/services/messaging.service.js");
    prisma = prismaModule.prisma;
    service = new serviceModule.MessagingService();

    await cleanup();

    await prisma.organization.createMany({
      data: [
        { id: orgA, name: "Messaging Unit Org A", plan: "ENTERPRISE" },
        { id: orgB, name: "Messaging Unit Org B", plan: "ENTERPRISE" }
      ]
    });

    await prisma.user.createMany({
      data: [
        { id: userA1, email: "msg.unit.a1@example.com", passwordHash: "x", role: "ADMIN", organizationId: orgA },
        { id: userA2, email: "msg.unit.a2@example.com", passwordHash: "x", role: "MEMBER", organizationId: orgA },
        { id: userB1, email: "msg.unit.b1@example.com", passwordHash: "x", role: "ADMIN", organizationId: orgB }
      ]
    });

    await prisma.messageThread.create({
      data: { id: threadA, organizationId: orgA }
    });
  });

  afterAll(async () => {
    await cleanup();
  });

  it("creates messages and returns tenant-scoped thread content", async () => {
    await service.createMessage(threadA, userA1, "Hello A");
    await service.createMessage(threadA, userA2, "Reply A");

    const thread = await service.getThread(threadA, orgA);
    expect(thread.id).toBe(threadA);
    expect(thread.messages).toHaveLength(2);
    expect(thread.messages[0].content).toBe("Hello A");
    expect(thread.messages[1].content).toBe("Reply A");
  });

  it("creates thread only when all participants belong to organization", async () => {
    const created = await service.createThread([userA1, userA2], orgA);
    expect(created.organizationId).toBe(orgA);

    await expect(service.createThread([userA1, userB1], orgA)).rejects.toMatchObject({
      code: "INVALID_THREAD_PARTICIPANTS"
    });
  });
});
