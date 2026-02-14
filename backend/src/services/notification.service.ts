import { FeatureModuleName } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/app-error.js";
import type {
  CreateNotificationInput,
  GetNotificationsQueryInput
} from "../validators/notification.validator.js";

export class NotificationService {
  async getNotifications(
    userId: string,
    organizationId: string,
    query: GetNotificationsQueryInput
  ) {
    return prisma.notification.findMany({
      where: {
        userId,
        organizationId,
        ...(query.unreadOnly ? { read: false } : {})
      },
      select: {
        id: true,
        userId: true,
        organizationId: true,
        type: true,
        title: true,
        message: true,
        read: true,
        createdAt: true
      },
      orderBy: { createdAt: "desc" }
    });
  }

  async createNotification(organizationId: string, input: CreateNotificationInput) {
    const moduleConfig = await prisma.featureModule.findUnique({
      where: {
        organizationId_name: {
          organizationId,
          name: FeatureModuleName.NOTIFICATIONS
        }
      },
      select: { enabled: true }
    });

    if (!moduleConfig?.enabled) {
      throw new AppError(403, "This feature requires plan upgrade", "FEATURE_LOCKED");
    }

    if (input.userId) {
      const user = await prisma.user.findFirst({
        where: {
          id: input.userId,
          organizationId
        },
        select: { id: true }
      });

      if (!user) {
        throw new AppError(400, "Target user must belong to organization", "INVALID_NOTIFICATION_TARGET");
      }

      const created = await prisma.notification.create({
        data: {
          userId: input.userId,
          organizationId,
          type: input.type,
          title: input.title,
          message: input.message,
          read: false
        },
        select: {
          id: true,
          userId: true,
          organizationId: true,
          type: true,
          title: true,
          message: true,
          read: true,
          createdAt: true
        }
      });

      return { scope: "user" as const, notifications: [created] };
    }

    const users = await prisma.user.findMany({
      where: { organizationId },
      select: { id: true }
    });

    if (users.length === 0) {
      return { scope: "organization" as const, notifications: [] };
    }

    await prisma.notification.createMany({
      data: users.map((user) => ({
        userId: user.id,
        organizationId,
        type: input.type,
        title: input.title,
        message: input.message,
        read: false
      }))
    });

    const created = await prisma.notification.findMany({
      where: {
        organizationId,
        title: input.title,
        message: input.message,
        type: input.type,
        userId: { in: users.map((user) => user.id) }
      },
      select: {
        id: true,
        userId: true,
        organizationId: true,
        type: true,
        title: true,
        message: true,
        read: true,
        createdAt: true
      },
      orderBy: { createdAt: "desc" },
      take: users.length
    });

    return { scope: "organization" as const, notifications: created };
  }

  async markAsRead(userId: string, organizationId: string, notificationId: string) {
    const result = await prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId,
        organizationId
      },
      data: {
        read: true
      }
    });

    if (result.count === 0) {
      throw new AppError(404, "Notification not found", "NOTIFICATION_NOT_FOUND");
    }

    const updated = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId,
        organizationId
      },
      select: {
        id: true,
        userId: true,
        organizationId: true,
        type: true,
        title: true,
        message: true,
        read: true,
        createdAt: true
      }
    });

    if (!updated) {
      throw new AppError(404, "Notification not found", "NOTIFICATION_NOT_FOUND");
    }

    return updated;
  }

  async markAllAsRead(userId: string, organizationId: string) {
    const result = await prisma.notification.updateMany({
      where: {
        userId,
        organizationId,
        read: false
      },
      data: {
        read: true
      }
    });

    return {
      updatedCount: result.count
    };
  }
}
