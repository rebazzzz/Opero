import { z } from "zod";

export const threadParamsSchema = z.object({
  threadId: z.string().min(1)
});

export const sendMessageSchema = z.object({
  threadId: z.string().min(1),
  content: z.string().trim().min(1).max(4000)
});

export const createThreadSchema = z.object({
  participants: z.array(z.string().min(1)).min(1)
});

export type ThreadParamsInput = z.infer<typeof threadParamsSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type CreateThreadInput = z.infer<typeof createThreadSchema>;
