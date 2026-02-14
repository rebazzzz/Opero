import { createHash } from "node:crypto";
import bcrypt from "bcryptjs";
import { env } from "../config/env.js";

export const hashPassword = async (plainTextPassword: string): Promise<string> => {
  return bcrypt.hash(plainTextPassword, env.BCRYPT_SALT_ROUNDS);
};

export const comparePassword = async (
  plainTextPassword: string,
  passwordHash: string
): Promise<boolean> => {
  return bcrypt.compare(plainTextPassword, passwordHash);
};

export const hashToken = (token: string): string => {
  return createHash("sha256").update(token).digest("hex");
};
