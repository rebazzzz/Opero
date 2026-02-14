import { FeatureModuleName, UserRole } from "@prisma/client";
import { Router } from "express";
import { NotificationController } from "../controllers/notification.controller.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorizeRoles } from "../middlewares/authorize-roles.js";
import { organizationScope } from "../middlewares/organization-scope.js";
import { requireFeatureModule } from "../middlewares/feature-module-guard.js";
import { validateRequest } from "../middlewares/validate-request.js";
import { asyncHandler } from "../utils/async-handler.js";
import {
  createNotificationSchema,
  getNotificationsQuerySchema,
  notificationParamsSchema
} from "../validators/notification.validator.js";

const router = Router();
const notificationController = new NotificationController();

router.use(authenticate, organizationScope, requireFeatureModule(FeatureModuleName.NOTIFICATIONS));

router.get(
  "/",
  validateRequest({ query: getNotificationsQuerySchema }),
  asyncHandler(notificationController.getNotifications.bind(notificationController))
);

router.post(
  "/",
  authorizeRoles(UserRole.ADMIN),
  validateRequest({ body: createNotificationSchema }),
  asyncHandler(notificationController.createNotification.bind(notificationController))
);

router.patch(
  "/read-all",
  asyncHandler(notificationController.markAllAsRead.bind(notificationController))
);

router.patch(
  "/:id/read",
  validateRequest({ params: notificationParamsSchema }),
  asyncHandler(notificationController.markAsRead.bind(notificationController))
);

export { router as notificationsRoutes };
