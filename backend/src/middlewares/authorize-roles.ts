import type { UserRole } from "@prisma/client";
import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/app-error.js";

export const authorizeRoles = (...allowedRoles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.auth) {
      next(new AppError(401, "Authentication is required", "UNAUTHORIZED"));
      return;
    }

    if (!allowedRoles.includes(req.auth.role)) {
      next(new AppError(403, "Insufficient permissions", "FORBIDDEN"));
      return;
    }

    next();
  };
};
