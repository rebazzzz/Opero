import { FeatureModuleName, UserRole } from "@prisma/client";
import { Router } from "express";
import { DashboardController } from "../controllers/dashboard.controller.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorizeRoles } from "../middlewares/authorize-roles.js";
import { organizationScope } from "../middlewares/organization-scope.js";
import { requireFeatureModule } from "../middlewares/feature-module-guard.js";
import { asyncHandler } from "../utils/async-handler.js";

const router = Router();
const dashboardController = new DashboardController();

router.use(
  authenticate,
  organizationScope,
  authorizeRoles(UserRole.ADMIN, UserRole.MEMBER),
  requireFeatureModule(FeatureModuleName.ANALYTICS)
);

router.get("/summary", asyncHandler(dashboardController.summary.bind(dashboardController)));

export { router as dashboardRoutes };
