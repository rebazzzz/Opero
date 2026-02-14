import { Router } from "express";
import { HealthController } from "../controllers/health.controller.js";
import { asyncHandler } from "../utils/async-handler.js";

const router = Router();
const healthController = new HealthController();

router.get("/", asyncHandler(healthController.check.bind(healthController)));

export { router as healthRoutes };
