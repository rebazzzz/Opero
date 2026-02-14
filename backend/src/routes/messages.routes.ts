import { FeatureModuleName, UserRole } from "@prisma/client";
import { Router } from "express";
import { MessagingController } from "../controllers/messaging.controller.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorizeRoles } from "../middlewares/authorize-roles.js";
import { organizationScope } from "../middlewares/organization-scope.js";
import { requireFeatureModule } from "../middlewares/feature-module-guard.js";
import { validateRequest } from "../middlewares/validate-request.js";
import { asyncHandler } from "../utils/async-handler.js";
import { sendMessageSchema, threadParamsSchema } from "../validators/messaging.validator.js";

const router = Router();
const messagingController = new MessagingController();

router.use(
  authenticate,
  organizationScope,
  authorizeRoles(UserRole.ADMIN, UserRole.MEMBER),
  requireFeatureModule(FeatureModuleName.MESSAGING)
);

router.get(
  "/:threadId",
  validateRequest({ params: threadParamsSchema }),
  asyncHandler(messagingController.listMessages.bind(messagingController))
);

router.post(
  "/",
  validateRequest({ body: sendMessageSchema }),
  asyncHandler(messagingController.sendMessage.bind(messagingController))
);

export { router as messagesRoutes };
