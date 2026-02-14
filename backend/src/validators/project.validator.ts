import { ProjectStatus } from "@prisma/client";
import { z } from "zod";

export const listProjectsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.nativeEnum(ProjectStatus).optional(),
  clientId: z.string().min(1).optional(),
  search: z.string().trim().max(120).optional()
});

export const createProjectSchema = z.object({
  clientId: z.string().min(1),
  name: z.string().trim().min(2).max(160),
  description: z.string().trim().max(2000).optional(),
  status: z.nativeEnum(ProjectStatus).optional().default(ProjectStatus.ACTIVE),
  budget: z.coerce.number().nonnegative().optional()
});

export const updateProjectSchema = z.object({
  clientId: z.string().min(1).optional(),
  name: z.string().trim().min(2).max(160).optional(),
  description: z.string().trim().max(2000).nullable().optional(),
  status: z.nativeEnum(ProjectStatus).optional(),
  budget: z.coerce.number().nonnegative().nullable().optional()
});

export const projectParamsSchema = z.object({
  projectId: z.string().min(1)
});

export type ListProjectsQueryInput = z.infer<typeof listProjectsQuerySchema>;
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type ProjectParamsInput = z.infer<typeof projectParamsSchema>;
