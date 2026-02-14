import { AuditAction, AuditEntityType } from "@prisma/client";
import { FeatureModuleName, UserRole } from "@prisma/client";
import { z } from "zod";

export const userParamsSchema = z.object({
  userId: z.string().min(1)
});

export const updateUserRoleSchema = z.object({
  role: z.nativeEnum(UserRole)
});

export const featureModuleParamsSchema = z.object({
  moduleName: z.nativeEnum(FeatureModuleName)
});

export const updateFeatureModuleSchema = z.object({
  enabled: z.boolean()
});

export const listAuditLogsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  action: z.nativeEnum(AuditAction).optional(),
  entityType: z.nativeEnum(AuditEntityType).optional(),
  entityId: z.string().min(1).optional(),
  actorUserId: z.string().min(1).optional(),
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional()
});

export type UserParamsInput = z.infer<typeof userParamsSchema>;
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
export type FeatureModuleParamsInput = z.infer<typeof featureModuleParamsSchema>;
export type UpdateFeatureModuleInput = z.infer<typeof updateFeatureModuleSchema>;
export type ListAuditLogsQueryInput = z.infer<typeof listAuditLogsQuerySchema>;
