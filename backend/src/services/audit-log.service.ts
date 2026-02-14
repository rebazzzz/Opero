import { AuditAction, AuditEntityType, type Prisma } from "@prisma/client";

export interface AuditLogInput {
  organizationId: string;
  actorUserId?: string;
  entityType: AuditEntityType;
  entityId: string;
  action: AuditAction;
  metadata?: Prisma.InputJsonValue;
}

export class AuditLogService {
  async record(tx: Prisma.TransactionClient, input: AuditLogInput): Promise<void> {
    await tx.auditLog.create({
      data: {
        organizationId: input.organizationId,
        actorUserId: input.actorUserId ?? null,
        entityType: input.entityType,
        entityId: input.entityId,
        action: input.action,
        metadata: input.metadata
      }
    });
  }
}
