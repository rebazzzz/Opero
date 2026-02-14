import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/app-error.js";

export const organizationScope = (req: Request, _res: Response, next: NextFunction): void => {
  if (!req.auth?.organizationId) {
    next(new AppError(401, "Organization context is required", "MISSING_ORG_CONTEXT"));
    return;
  }

  const requestedOrganizationId = req.headers["x-organization-id"]?.toString();

  if (requestedOrganizationId && requestedOrganizationId !== req.auth.organizationId) {
    next(new AppError(403, "Cross-organization access is forbidden", "ORG_SCOPE_VIOLATION"));
    return;
  }

  req.organizationId = req.auth.organizationId;
  next();
};
