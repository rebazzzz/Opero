import { UserRole } from "@prisma/client";
import { Router } from "express";
import { ClientController } from "../controllers/client.controller.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorizeRoles } from "../middlewares/authorize-roles.js";
import { organizationScope } from "../middlewares/organization-scope.js";
import { validateRequest } from "../middlewares/validate-request.js";
import { asyncHandler } from "../utils/async-handler.js";
import {
  clientParamsSchema,
  createClientSchema,
  listClientsQuerySchema,
  updateClientSchema
} from "../validators/client.validator.js";

const router = Router();
const clientController = new ClientController();

router.use(authenticate, organizationScope, authorizeRoles(UserRole.ADMIN, UserRole.MEMBER));

router.post(
  "/",
  validateRequest({ body: createClientSchema }),
  asyncHandler(clientController.create.bind(clientController))
);

router.get(
  "/",
  validateRequest({ query: listClientsQuerySchema }),
  asyncHandler(clientController.list.bind(clientController))
);

router.get(
  "/:clientId",
  validateRequest({ params: clientParamsSchema }),
  asyncHandler(clientController.getById.bind(clientController))
);

router.patch(
  "/:clientId",
  validateRequest({ params: clientParamsSchema, body: updateClientSchema }),
  asyncHandler(clientController.update.bind(clientController))
);

export { router as clientRoutes };
