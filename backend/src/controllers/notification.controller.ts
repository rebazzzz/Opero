import type { Request, Response } from "express";
import { NotificationService } from "../services/notification.service.js";
import {
  emitNotificationNewToOrganization,
  emitNotificationNewToUser,
  emitNotificationReadToUser
} from "../sockets/messaging.socket.js";
import type {
  CreateNotificationInput,
  GetNotificationsQueryInput,
  NotificationParamsInput
} from "../validators/notification.validator.js";

const notificationService = new NotificationService();

export class NotificationController {
  async getNotifications(req: Request, res: Response): Promise<void> {
    const query = req.query as unknown as GetNotificationsQueryInput;
    const data = await notificationService.getNotifications(req.auth!.userId, req.organizationId!, query);
    res.status(200).json({ success: true, data });
  }

  async createNotification(req: Request, res: Response): Promise<void> {
    const body = req.body as CreateNotificationInput;
    const result = await notificationService.createNotification(req.organizationId!, body);

    if (result.scope === "user") {
      const created = result.notifications[0];
      emitNotificationNewToUser(created.userId, { notification: created });
    } else {
      emitNotificationNewToOrganization(req.organizationId!, { notifications: result.notifications });
    }

    res.status(201).json({ success: true, data: result.notifications });
  }

  async markAsRead(req: Request, res: Response): Promise<void> {
    const params = req.params as unknown as NotificationParamsInput;
    const data = await notificationService.markAsRead(req.auth!.userId, req.organizationId!, params.id);

    emitNotificationReadToUser(req.auth!.userId, { notification: data });
    res.status(200).json({ success: true, data });
  }

  async markAllAsRead(req: Request, res: Response): Promise<void> {
    const data = await notificationService.markAllAsRead(req.auth!.userId, req.organizationId!);

    emitNotificationReadToUser(req.auth!.userId, {
      allRead: true,
      updatedCount: data.updatedCount
    });
    res.status(200).json({ success: true, data });
  }
}
