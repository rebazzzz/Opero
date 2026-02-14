import { UserRole } from "@prisma/client";
import { Router } from "express";
import { AdminController } from "../controllers/admin.controller.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorizeRoles } from "../middlewares/authorize-roles.js";
import { organizationScope } from "../middlewares/organization-scope.js";
import { validateRequest } from "../middlewares/validate-request.js";
import { asyncHandler } from "../utils/async-handler.js";
import {
  featureModuleParamsSchema,
  listAuditLogsQuerySchema,
  updateFeatureModuleSchema,
  updateUserRoleSchema,
  userParamsSchema
} from "../validators/admin.validator.js";

const router = Router();
const adminController = new AdminController();

router.use(authenticate, organizationScope, authorizeRoles(UserRole.ADMIN));

router.get(
  "/audit-logs",
  validateRequest({ query: listAuditLogsQuerySchema }),
  asyncHandler(adminController.listAuditLogs.bind(adminController))
);

router.patch(
  "/users/:userId/role",
  validateRequest({ params: userParamsSchema, body: updateUserRoleSchema }),
  asyncHandler(adminController.updateUserRole.bind(adminController))
);

router.patch(
  "/features/:moduleName",
  validateRequest({ params: featureModuleParamsSchema, body: updateFeatureModuleSchema }),
  asyncHandler(adminController.updateFeatureModule.bind(adminController))
);

export { router as adminRoutes };
