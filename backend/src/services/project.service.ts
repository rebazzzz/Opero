import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/app-error.js";
import type {
  CreateProjectInput,
  ListProjectsQueryInput,
  UpdateProjectInput
} from "../validators/project.validator.js";

const toPrismaBudget = (value: number | null): Prisma.Decimal | null => {
  if (value === null) {
    return null;
  }

  return new Prisma.Decimal(value);
};

export class ProjectService {
  async create(organizationId: string, input: CreateProjectInput) {
    return prisma.$transaction(async (tx) => {
      const client = await tx.client.findFirst({
        where: {
          id: input.clientId,
          organizationId
        },
        select: { id: true }
      });

      if (!client) {
        throw new AppError(400, "Client does not belong to this organization", "INVALID_CLIENT_SCOPE");
      }

      const data: Prisma.ProjectUncheckedCreateInput = {
        organizationId,
        clientId: input.clientId,
        name: input.name,
        status: input.status
      };

      if (input.description !== undefined) {
        data.description = input.description;
      }
      if (input.budget !== undefined) {
        data.budget = toPrismaBudget(input.budget);
      }

      return tx.project.create({
        data
      });
    });
  }

  async list(organizationId: string, query: ListProjectsQueryInput) {
    const page = query.page;
    const limit = query.limit;
    const skip = (page - 1) * limit;
    const trimmedSearch = query.search?.trim();

    const where: Prisma.ProjectWhereInput = {
      organizationId,
      ...(query.status ? { status: query.status } : {}),
      ...(query.clientId ? { clientId: query.clientId } : {}),
      ...(trimmedSearch
        ? {
            OR: [
              { name: { contains: trimmedSearch, mode: "insensitive" } },
              { description: { contains: trimmedSearch, mode: "insensitive" } }
            ]
          }
        : {})
    };

    const [items, total] = await Promise.all([
      prisma.project.findMany({
        where,
        select: {
          id: true,
          clientId: true,
          name: true,
          description: true,
          status: true,
          budget: true,
          createdAt: true,
          updatedAt: true
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit
      }),
      prisma.project.count({ where })
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

  async getById(organizationId: string, projectId: string) {
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        organizationId
      }
    });

    if (!project) {
      throw new AppError(404, "Project not found", "PROJECT_NOT_FOUND");
    }

    return project;
  }

  async update(organizationId: string, projectId: string, input: UpdateProjectInput) {
    return prisma.$transaction(async (tx) => {
      if (input.clientId !== undefined) {
        const client = await tx.client.findFirst({
          where: {
            id: input.clientId,
            organizationId
          },
          select: { id: true }
        });

        if (!client) {
          throw new AppError(400, "Client does not belong to this organization", "INVALID_CLIENT_SCOPE");
        }
      }

      const data: Prisma.ProjectUncheckedUpdateManyInput = {};
      if (input.clientId !== undefined) {
        data.clientId = input.clientId;
      }
      if (input.name !== undefined) {
        data.name = input.name;
      }
      if (input.description !== undefined) {
        data.description = input.description;
      }
      if (input.status !== undefined) {
        data.status = input.status;
      }
      if (input.budget !== undefined) {
        data.budget = toPrismaBudget(input.budget);
      }

      const result = await tx.project.updateMany({
        where: {
          id: projectId,
          organizationId
        },
        data
      });

      if (result.count === 0) {
        throw new AppError(404, "Project not found", "PROJECT_NOT_FOUND");
      }

      const project = await tx.project.findFirst({
        where: {
          id: projectId,
          organizationId
        }
      });

      if (!project) {
        throw new AppError(404, "Project not found", "PROJECT_NOT_FOUND");
      }

      return project;
    });
  }
}
