import { createHash } from "node:crypto";
import { Prisma } from "@prisma/client";
import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env.js";
import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/app-error.js";

const IDEMPOTENCY_HEADER = "idempotency-key";

const hashRequestBody = (body: unknown): string => {
  const payload = body === undefined ? "" : JSON.stringify(body);
  return createHash("sha256").update(payload).digest("hex");
};

const routeKey = (req: Request): string => req.baseUrl + (req.route ? String(req.route.path) : req.path);

export const requireIdempotency = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.auth?.userId || !req.organizationId) {
    next(new AppError(401, "Authentication context is required", "UNAUTHORIZED"));
    return;
  }

  const key = req.header(IDEMPOTENCY_HEADER)?.trim();
  if (!key) {
    next(new AppError(400, "Idempotency-Key header is required", "IDEMPOTENCY_KEY_REQUIRED"));
    return;
  }

  const method = req.method.toUpperCase();
  const route = routeKey(req);
  const organizationId = req.organizationId;
  const userId = req.auth.userId;
  const requestHash = hashRequestBody(req.body);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + env.IDEMPOTENCY_TTL_SECONDS * 1_000);

  const uniqueWhere = {
    organizationId_userId_method_route_key: {
      organizationId,
      userId,
      method,
      route,
      key
    }
  };

  const replayExisting = async (): Promise<boolean> => {
    const existing = await prisma.idempotencyKey.findUnique({
      where: uniqueWhere
    });

    if (!existing) {
      return false;
    }

    if (existing.expiresAt <= now) {
      await prisma.idempotencyKey.delete({
        where: { id: existing.id }
      });
      return false;
    }

    if (existing.requestHash !== requestHash) {
      throw new AppError(
        409,
        "Idempotency key cannot be reused with different payload",
        "IDEMPOTENCY_KEY_REUSED"
      );
    }

    if (existing.responseStatus === null || existing.responseBody === null) {
      throw new AppError(409, "Request with this idempotency key is still processing", "IDEMPOTENCY_IN_PROGRESS");
    }

    res.setHeader("Idempotency-Replayed", "true");
    res.status(existing.responseStatus).json(existing.responseBody);
    return true;
  };

  try {
    await prisma.idempotencyKey.create({
      data: {
        organizationId,
        userId,
        method,
        route,
        key,
        requestHash,
        expiresAt
      }
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      try {
        const replayed = await replayExisting();
        if (replayed) {
          return;
        }
      } catch (replayError) {
        next(replayError);
        return;
      }
    } else {
      next(error);
      return;
    }
  }

  const originalJson = res.json.bind(res);

  res.json = ((body: unknown) => {
    const statusCode = res.statusCode;

    void prisma.idempotencyKey
      .updateMany({
        where: {
          organizationId,
          userId,
          method,
          route,
          key,
          requestHash
        },
        data: {
          responseStatus: statusCode,
          responseBody: body as Prisma.InputJsonValue
        }
      })
      .catch(() => undefined)
      .finally(() => {
        originalJson(body);
      });

    return res;
  }) as Response["json"];

  next();
};
