import { Router } from "express";
import { AuthController } from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/authenticate.js";
import { organizationScope } from "../middlewares/organization-scope.js";
import { validateRequest } from "../middlewares/validate-request.js";
import { asyncHandler } from "../utils/async-handler.js";
import {
  loginSchema,
  logoutSchema,
  refreshTokenSchema,
  registerSchema
} from "../validators/auth.validator.js";

const router = Router();
const authController = new AuthController();

router.post(
  "/register",
  validateRequest({ body: registerSchema }),
  asyncHandler(authController.register.bind(authController))
);
router.post(
  "/login",
  validateRequest({ body: loginSchema }),
  asyncHandler(authController.login.bind(authController))
);
router.post(
  "/refresh",
  validateRequest({ body: refreshTokenSchema }),
  asyncHandler(authController.refresh.bind(authController))
);
router.post(
  "/logout",
  validateRequest({ body: logoutSchema }),
  asyncHandler(authController.logout.bind(authController))
);
router.get(
  "/me",
  authenticate,
  organizationScope,
  asyncHandler(authController.me.bind(authController))
);

export { router as authRoutes };
