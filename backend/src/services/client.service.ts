import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/app-error.js";
import type {
  CreateClientInput,
  ListClientsQueryInput,
  UpdateClientInput
} from "../validators/client.validator.js";

export class ClientService {
  async create(organizationId: string, input: CreateClientInput) {
    try {
      return await prisma.client.create({
        data: {
          organizationId,
          name: input.name,
          email: input.email,
          phone: input.phone,
          status: input.status
        }
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new AppError(409, "Client email already exists in this organization", "CLIENT_EMAIL_EXISTS");
      }

      throw error;
    }
  }

  async list(organizationId: string, query: ListClientsQueryInput) {
    const page = query.page;
    const limit = query.limit;
    const skip = (page - 1) * limit;
    const trimmedSearch = query.search?.trim();

    const where: Prisma.ClientWhereInput = {
      organizationId,
      ...(query.status ? { status: query.status } : {}),
      ...(trimmedSearch
        ? {
            OR: [
              { name: { contains: trimmedSearch, mode: "insensitive" } },
              { email: { contains: trimmedSearch, mode: "insensitive" } },
              { phone: { contains: trimmedSearch, mode: "insensitive" } }
            ]
          }
        : {})
    };

    const [items, total] = await Promise.all([
      prisma.client.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit
      }),
      prisma.client.count({ where })
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

  async getById(organizationId: string, clientId: string) {
    const client = await prisma.client.findFirst({
      where: {
        id: clientId,
        organizationId
      }
    });

    if (!client) {
      throw new AppError(404, "Client not found", "CLIENT_NOT_FOUND");
    }

    return client;
  }

  async update(organizationId: string, clientId: string, input: UpdateClientInput) {
    await this.getById(organizationId, clientId);

    try {
      return await prisma.client.update({
        where: { id: clientId },
        data: {
          ...(input.name !== undefined ? { name: input.name } : {}),
          ...(input.email !== undefined ? { email: input.email } : {}),
          ...(input.phone !== undefined ? { phone: input.phone } : {}),
          ...(input.status !== undefined ? { status: input.status } : {})
        }
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new AppError(409, "Client email already exists in this organization", "CLIENT_EMAIL_EXISTS");
      }

      throw error;
    }
  }
}
