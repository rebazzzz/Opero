import type { FeatureModuleName } from "@prisma/client";
import type { NextFunction, Request, Response } from "express";
import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/app-error.js";

export const requireFeatureModule = (moduleName: FeatureModuleName) => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const organizationId = req.organizationId ?? req.auth?.organizationId;

    if (!organizationId) {
      next(new AppError(401, "Organization context is required", "MISSING_ORG_CONTEXT"));
      return;
    }

    const moduleConfig = await prisma.featureModule.findUnique({
      where: {
        organizationId_name: {
          organizationId,
          name: moduleName
        }
      },
      select: {
        enabled: true
      }
    });

    if (!moduleConfig?.enabled) {
      next(new AppError(403, `${moduleName} feature is disabled for this organization`, "FEATURE_LOCKED"));
      return;
    }

    next();
  };
};
