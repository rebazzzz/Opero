import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/app-error.js";

export const notFoundHandler = (req: Request, _res: Response, next: NextFunction): void => {
  next(new AppError(404, `Route not found: ${req.method} ${req.originalUrl}`, "NOT_FOUND"));
};
