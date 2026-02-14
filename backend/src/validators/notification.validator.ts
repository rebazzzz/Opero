import { NotificationType } from "@prisma/client";
import { z } from "zod";

export const getNotificationsQuerySchema = z.object({
  unreadOnly: z
    .union([z.boolean(), z.enum(["true", "false"])])
    .optional()
    .transform((value) => (typeof value === "string" ? value === "true" : value))
});

export const createNotificationSchema = z.object({
  userId: z.string().min(1).optional(),
  type: z.nativeEnum(NotificationType),
  title: z.string().trim().min(1).max(200),
  message: z.string().trim().min(1).max(2000)
});

export const notificationParamsSchema = z.object({
  id: z.string().min(1)
});

export type GetNotificationsQueryInput = z.infer<typeof getNotificationsQuerySchema>;
export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;
export type NotificationParamsInput = z.infer<typeof notificationParamsSchema>;
