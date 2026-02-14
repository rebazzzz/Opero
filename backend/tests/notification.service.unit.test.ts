import { afterAll, beforeAll, describe, expect, it } from "vitest";

let prisma: import("@prisma/client").PrismaClient;
let service: import("../src/services/notification.service.js").NotificationService;

const orgA = "org_not_unit_a";
const orgB = "org_not_unit_b";
const userA1 = "usr_not_unit_a1";
const userA2 = "usr_not_unit_a2";
const userB1 = "usr_not_unit_b1";

const cleanup = async (): Promise<void> => {
  await prisma.notification.deleteMany({
    where: { organizationId: { in: [orgA, orgB] } }
  });
  await prisma.organization.deleteMany({
    where: { id: { in: [orgA, orgB] } }
  });
};

describe("NotificationService", () => {
  beforeAll(async () => {
    process.env.JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET ?? "12345678901234567890123456789012";
    process.env.JWT_REFRESH_SECRET =
      process.env.JWT_REFRESH_SECRET ?? "abcdefghijklmnopqrstuvwxyz123456";

    const prismaModule = await import("../src/config/prisma.js");
    const serviceModule = await import("../src/services/notification.service.js");
    prisma = prismaModule.prisma;
    service = new serviceModule.NotificationService();

    await cleanup();

    await prisma.organization.createMany({
      data: [
        { id: orgA, name: "Notification Unit A", plan: "ENTERPRISE" },
        { id: orgB, name: "Notification Unit B", plan: "ENTERPRISE" }
      ]
    });

    await prisma.user.createMany({
      data: [
        { id: userA1, email: "not.unit.a1@example.com", passwordHash: "x", role: "ADMIN", organizationId: orgA },
        { id: userA2, email: "not.unit.a2@example.com", passwordHash: "x", role: "MEMBER", organizationId: orgA },
        { id: userB1, email: "not.unit.b1@example.com", passwordHash: "x", role: "ADMIN", organizationId: orgB }
      ]
    });

    await prisma.featureModule.createMany({
      data: [
        { organizationId: orgA, name: "NOTIFICATIONS", enabled: true },
        { organizationId: orgB, name: "NOTIFICATIONS", enabled: true }
      ]
    });
  });

  afterAll(async () => {
    await cleanup();
  });

  it("creates notifications and returns tenant-scoped user list with unreadOnly", async () => {
    await service.createNotification(orgA, {
      userId: userA1,
      type: "INFO",
      title: "A1 Info",
      message: "Message for A1"
    });

    await service.createNotification(orgA, {
      userId: userA1,
      type: "WARNING",
      title: "A1 Warning",
      message: "Warning for A1"
    });

    await prisma.notification.updateMany({
      where: { userId: userA1, organizationId: orgA, title: "A1 Info" },
      data: { read: true }
    });

    const all = await service.getNotifications(userA1, orgA, {});
    const unread = await service.getNotifications(userA1, orgA, { unreadOnly: true });

    expect(all.length).toBe(2);
    expect(unread.length).toBe(1);
    expect(unread[0].title).toBe("A1 Warning");
  });

  it("supports organization broadcast and respects tenant scope", async () => {
    const result = await service.createNotification(orgA, {
      type: "ALERT",
      title: "Org Broadcast",
      message: "Hello org A"
    });

    expect(result.scope).toBe("organization");
    expect(result.notifications.length).toBe(2);

    const orgBNotifications = await service.getNotifications(userB1, orgB, {});
    expect(orgBNotifications.length).toBe(0);
  });

  it("markAsRead marks only owned notification", async () => {
    const target = await prisma.notification.create({
      data: {
        userId: userA1,
        organizationId: orgA,
        type: "INFO",
        title: "To read",
        message: "mark me",
        read: false
      }
    });

    const marked = await service.markAsRead(userA1, orgA, target.id);
    expect(marked.read).toBe(true);

    await expect(service.markAsRead(userB1, orgB, target.id)).rejects.toMatchObject({
      code: "NOTIFICATION_NOT_FOUND"
    });
  });

  it("markAllAsRead marks all unread for current user and organization", async () => {
    const unreadBefore = await service.getNotifications(userA2, orgA, { unreadOnly: true });

    await prisma.notification.createMany({
      data: [
        {
          id: "not_unit_markall_1",
          userId: userA2,
          organizationId: orgA,
          type: "INFO",
          title: "unread 1",
          message: "one",
          read: false
        },
        {
          id: "not_unit_markall_2",
          userId: userA2,
          organizationId: orgA,
          type: "WARNING",
          title: "unread 2",
          message: "two",
          read: false
        },
        {
          id: "not_unit_markall_3",
          userId: userB1,
          organizationId: orgB,
          type: "ALERT",
          title: "other org unread",
          message: "three",
          read: false
        }
      ]
    });

    const result = await service.markAllAsRead(userA2, orgA);
    expect(result.updatedCount).toBe(unreadBefore.length + 2);

    const userA2Unread = await service.getNotifications(userA2, orgA, { unreadOnly: true });
    expect(userA2Unread).toHaveLength(0);

    const userBUnread = await service.getNotifications(userB1, orgB, { unreadOnly: true });
    expect(userBUnread.length).toBeGreaterThan(0);
  });
});
