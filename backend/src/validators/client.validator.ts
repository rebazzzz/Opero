import { ClientStatus } from "@prisma/client";
import { z } from "zod";

export const listClientsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.nativeEnum(ClientStatus).optional(),
  search: z.string().trim().max(120).optional()
});

export const createClientSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().email().transform((value) => value.toLowerCase()),
  phone: z.string().trim().max(30).optional(),
  status: z.nativeEnum(ClientStatus).optional().default(ClientStatus.ACTIVE)
});

export const updateClientSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  email: z.string().email().transform((value) => value.toLowerCase()).optional(),
  phone: z.string().trim().max(30).nullable().optional(),
  status: z.nativeEnum(ClientStatus).optional()
});

export const clientParamsSchema = z.object({
  clientId: z.string().min(1)
});

export type ListClientsQueryInput = z.infer<typeof listClientsQuerySchema>;
export type CreateClientInput = z.infer<typeof createClientSchema>;
export type UpdateClientInput = z.infer<typeof updateClientSchema>;
export type ClientParamsInput = z.infer<typeof clientParamsSchema>;
