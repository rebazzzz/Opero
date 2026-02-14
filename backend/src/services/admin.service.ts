import { AuditAction, AuditEntityType, type FeatureModuleName } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/app-error.js";
import { AuditLogService } from "./audit-log.service.js";
import type {
  ListAuditLogsQueryInput,
  UpdateFeatureModuleInput,
  UpdateUserRoleInput
} from "../validators/admin.validator.js";

const auditLogService = new AuditLogService();

export class AdminService {
  async listAuditLogs(organizationId: string, query: ListAuditLogsQueryInput) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;
    const fromDate = query.fromDate ? new Date(query.fromDate) : undefined;
    const toDate = query.toDate ? new Date(query.toDate) : undefined;

    const where = {
      organizationId,
      ...(query.action ? { action: query.action } : {}),
      ...(query.entityType ? { entityType: query.entityType } : {}),
      ...(query.entityId ? { entityId: query.entityId } : {}),
      ...(query.actorUserId ? { actorUserId: query.actorUserId } : {}),
      ...(fromDate || toDate
        ? {
            createdAt: {
              ...(fromDate ? { gte: fromDate } : {}),
              ...(toDate ? { lte: toDate } : {})
            }
          }
        : {})
    };

    const [items, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        select: {
          id: true,
          organizationId: true,
          actorUserId: true,
          entityType: true,
          entityId: true,
          action: true,
          metadata: true,
          createdAt: true
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit
      }),
      prisma.auditLog.count({ where })
    ]);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async updateUserRole(
    organizationId: string,
    actorUserId: string,
    userId: string,
    input: UpdateUserRoleInput
  ) {
    if (actorUserId === userId) {
      throw new AppError(400, "You cannot change your own role", "SELF_ROLE_CHANGE_FORBIDDEN");
    }

    return prisma.$transaction(async (tx) => {
      const result = await tx.user.updateMany({
        where: {
          id: userId,
          organizationId
        },
        data: {
          role: input.role
        }
      });

      if (result.count === 0) {
        throw new AppError(404, "User not found", "USER_NOT_FOUND");
      }

      const updatedUser = await tx.user.findFirst({
        where: {
          id: userId,
          organizationId
        },
        select: {
          id: true,
          email: true,
          role: true,
          organizationId: true,
          updatedAt: true
        }
      });

      if (!updatedUser) {
        throw new AppError(404, "User not found", "USER_NOT_FOUND");
      }

      await auditLogService.record(tx, {
        organizationId,
        actorUserId,
        entityType: AuditEntityType.USER,
        entityId: updatedUser.id,
        action: AuditAction.USER_ROLE_CHANGED,
        metadata: {
          role: updatedUser.role
        }
      });

      return updatedUser;
    });
  }

  async updateFeatureModule(
    organizationId: string,
    actorUserId: string,
    moduleName: FeatureModuleName,
    input: UpdateFeatureModuleInput
  ) {
    return prisma.$transaction(async (tx) => {
      const featureModule = await tx.featureModule.upsert({
        where: {
          organizationId_name: {
            organizationId,
            name: moduleName
          }
        },
        update: {
          enabled: input.enabled
        },
        create: {
          organizationId,
          name: moduleName,
          enabled: input.enabled
        },
        select: {
          id: true,
          organizationId: true,
          name: true,
          enabled: true
        }
      });

      await auditLogService.record(tx, {
        organizationId,
        actorUserId,
        entityType: AuditEntityType.FEATURE_MODULE,
        entityId: featureModule.id,
        action: AuditAction.FEATURE_MODULE_TOGGLED,
        metadata: {
          name: featureModule.name,
          enabled: featureModule.enabled
        }
      });

      return featureModule;
    });
  }
}
