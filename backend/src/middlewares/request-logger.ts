import { randomUUID } from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import { logger } from "../config/logger.js";

export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const requestId = req.headers["x-request-id"]?.toString() ?? randomUUID();
  const startedAt = process.hrtime.bigint();

  res.setHeader("x-request-id", requestId);

  res.on("finish", () => {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;

    logger.info(
      {
        requestId,
        method: req.method,
        path: req.originalUrl,
        statusCode: res.statusCode,
        durationMs
      },
      "HTTP request completed"
    );
  });

  next();
};
