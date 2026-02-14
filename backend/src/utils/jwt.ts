import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import type { JwtClaims } from "../types/auth.js";
import { AppError } from "./app-error.js";

export const signAccessToken = (claims: Omit<JwtClaims, "type">): string => {
  return jwt.sign(
    {
      ...claims,
      type: "access"
    },
    env.JWT_ACCESS_SECRET,
    { expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions["expiresIn"] }
  );
};

export const signRefreshToken = (claims: Omit<JwtClaims, "type">): string => {
  return jwt.sign(
    {
      ...claims,
      type: "refresh"
    },
    env.JWT_REFRESH_SECRET,
    { expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions["expiresIn"] }
  );
};

const assertJwtClaims = (payload: string | jwt.JwtPayload): JwtClaims => {
  if (typeof payload === "string") {
    throw new AppError(401, "Invalid token payload", "INVALID_TOKEN");
  }

  const requiredKeys = ["sub", "organizationId", "role", "sessionId", "type"] as const;

  for (const key of requiredKeys) {
    if (!payload[key]) {
      throw new AppError(401, "Invalid token payload", "INVALID_TOKEN");
    }
  }

  return {
    sub: String(payload.sub),
    organizationId: String(payload.organizationId),
    role: payload.role as JwtClaims["role"],
    sessionId: String(payload.sessionId),
    type: payload.type as JwtClaims["type"]
  };
};

export const verifyAccessToken = (token: string): JwtClaims => {
  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET);
    const claims = assertJwtClaims(payload);

    if (claims.type !== "access") {
      throw new AppError(401, "Invalid access token type", "INVALID_ACCESS_TOKEN");
    }

    return claims;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(401, "Invalid or expired access token", "INVALID_ACCESS_TOKEN");
  }
};

export const verifyRefreshToken = (token: string): JwtClaims => {
  try {
    const payload = jwt.verify(token, env.JWT_REFRESH_SECRET);
    const claims = assertJwtClaims(payload);

    if (claims.type !== "refresh") {
      throw new AppError(401, "Invalid refresh token type", "INVALID_REFRESH_TOKEN");
    }

    return claims;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(401, "Invalid or expired refresh token", "INVALID_REFRESH_TOKEN");
  }
};
