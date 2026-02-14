import { UserRole } from "@prisma/client";
import { Router } from "express";
import { ProjectController } from "../controllers/project.controller.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorizeRoles } from "../middlewares/authorize-roles.js";
import { organizationScope } from "../middlewares/organization-scope.js";
import { validateRequest } from "../middlewares/validate-request.js";
import { asyncHandler } from "../utils/async-handler.js";
import {
  createProjectSchema,
  listProjectsQuerySchema,
  projectParamsSchema,
  updateProjectSchema
} from "../validators/project.validator.js";

const router = Router();
const projectController = new ProjectController();

router.use(authenticate, organizationScope, authorizeRoles(UserRole.ADMIN, UserRole.MEMBER));

router.post(
  "/",
  validateRequest({ body: createProjectSchema }),
  asyncHandler(projectController.create.bind(projectController))
);

router.get(
  "/",
  validateRequest({ query: listProjectsQuerySchema }),
  asyncHandler(projectController.list.bind(projectController))
);

router.get(
  "/:projectId",
  validateRequest({ params: projectParamsSchema }),
  asyncHandler(projectController.getById.bind(projectController))
);

router.patch(
  "/:projectId",
  validateRequest({ params: projectParamsSchema, body: updateProjectSchema }),
  asyncHandler(projectController.update.bind(projectController))
);

export { router as projectRoutes };
