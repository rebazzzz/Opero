import { Prisma } from "@prisma/client";
import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { logger } from "../config/logger.js";
import { AppError } from "../utils/app-error.js";

export const errorHandler = (
  error: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  logger.error(
    {
      err: error,
      method: req.method,
      path: req.originalUrl
    },
    "Request failed"
  );

  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details
      }
    });
    return;
  }

  if (error instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Request validation failed",
        details: error.flatten()
      }
    });
    return;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    res.status(400).json({
      success: false,
      error: {
        code: error.code,
        message: "Database request failed",
        details: error.meta
      }
    });
    return;
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    res.status(503).json({
      success: false,
      error: {
        code: "DATABASE_UNAVAILABLE",
        message: "Database connection is unavailable"
      }
    });
    return;
  }

  res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "An unexpected error occurred"
    }
  });
};
