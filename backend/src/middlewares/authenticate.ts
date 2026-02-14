import type { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../utils/jwt.js";
import { AppError } from "../utils/app-error.js";

export const authenticate = (req: Request, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    next(new AppError(401, "Authorization token is required", "UNAUTHORIZED"));
    return;
  }

  const token = authHeader.replace("Bearer ", "").trim();
  const claims = verifyAccessToken(token);

  req.auth = {
    userId: claims.sub,
    organizationId: claims.organizationId,
    role: claims.role,
    sessionId: claims.sessionId
  };

  next();
};
