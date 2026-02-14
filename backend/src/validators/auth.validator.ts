import { Plan, UserRole } from "@prisma/client";
import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(100, "Password is too long");

export const registerSchema = z.object({
  organizationName: z.string().trim().min(2).max(120),
  plan: z.nativeEnum(Plan).optional().default(Plan.FREE),
  email: z.string().email().transform((value) => value.toLowerCase()),
  password: passwordSchema,
  role: z.nativeEnum(UserRole).optional().default(UserRole.ADMIN)
});

export const loginSchema = z.object({
  organizationId: z.string().min(1),
  email: z.string().email().transform((value) => value.toLowerCase()),
  password: passwordSchema
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "refreshToken is required")
});

export const logoutSchema = z.object({
  refreshToken: z.string().min(1, "refreshToken is required")
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshInput = z.infer<typeof refreshTokenSchema>;
export type LogoutInput = z.infer<typeof logoutSchema>;
