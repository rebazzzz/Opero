import { AuditAction, AuditEntityType, InvoiceStatus, Prisma } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { AuditLogService } from "./audit-log.service.js";
import { AppError } from "../utils/app-error.js";
import type {
  CreateDraftInvoiceInput,
  ListInvoicesQueryInput,
  UpdateDraftInvoiceInput
} from "../validators/invoice.validator.js";

const toMoneyDecimal = (value: string): Prisma.Decimal => new Prisma.Decimal(value);

const assertMoneyTotal = (subtotal: Prisma.Decimal, tax: Prisma.Decimal, total: Prisma.Decimal): void => {
  if (!subtotal.plus(tax).equals(total)) {
    throw new AppError(400, "total must equal subtotal + tax", "INVALID_INVOICE_TOTAL");
  }
};

const auditLogService = new AuditLogService();

export class InvoiceService {
  async createDraft(organizationId: string, input: CreateDraftInvoiceInput, actorUserId?: string) {
    return prisma.$transaction(async (tx) => {
      const client = await tx.client.findFirst({
        where: { id: input.clientId, organizationId },
        select: { id: true }
      });

      if (!client) {
        throw new AppError(400, "Client does not belong to this organization", "INVALID_CLIENT_SCOPE");
      }

      if (input.projectId) {
        const project = await tx.project.findFirst({
          where: {
            id: input.projectId,
            organizationId,
            clientId: input.clientId
          },
          select: { id: true }
        });

        if (!project) {
          throw new AppError(
            400,
            "Project must belong to the same organization and client",
            "INVALID_PROJECT_SCOPE"
          );
        }
      }

      const subtotal = toMoneyDecimal(input.subtotal);
      const tax = toMoneyDecimal(input.tax);
      const total = toMoneyDecimal(input.total);

      assertMoneyTotal(subtotal, tax, total);

      try {
        const invoice = await tx.invoice.create({
          data: {
            organizationId,
            clientId: input.clientId,
            projectId: input.projectId ?? null,
            invoiceNumber: input.invoiceNumber.toUpperCase(),
            status: InvoiceStatus.DRAFT,
            currency: input.currency.toUpperCase(),
            subtotal,
            tax,
            total,
            dueDate: input.dueDate,
            issuedAt: null,
            paidAt: null
          }
        });

        await auditLogService.record(tx, {
          organizationId,
          actorUserId,
          entityType: AuditEntityType.INVOICE,
          entityId: invoice.id,
          action: AuditAction.INVOICE_DRAFT_CREATED,
          metadata: {
            status: invoice.status,
            invoiceNumber: invoice.invoiceNumber
          }
        });

        return invoice;
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2002"
        ) {
          throw new AppError(
            409,
            "Invoice number already exists in this organization",
            "INVOICE_NUMBER_EXISTS"
          );
        }

        throw error;
      }
    });
  }

  async updateDraft(
    organizationId: string,
    invoiceId: string,
    input: UpdateDraftInvoiceInput,
    actorUserId?: string
  ) {
    return prisma.$transaction(async (tx) => {
      const existing = await tx.invoice.findFirst({
        where: { id: invoiceId, organizationId },
        select: {
          id: true,
          status: true,
          clientId: true,
          projectId: true,
          subtotal: true,
          tax: true,
          total: true
        }
      });

      if (!existing) {
        throw new AppError(404, "Invoice not found", "INVOICE_NOT_FOUND");
      }

      if (existing.status !== InvoiceStatus.DRAFT) {
        throw new AppError(409, "Only DRAFT invoices can be updated", "INVALID_INVOICE_STATE");
      }

      const nextClientId = input.clientId ?? existing.clientId;
      const nextProjectId = input.projectId !== undefined ? input.projectId : existing.projectId;

      if (input.clientId !== undefined || existing.clientId) {
        const client = await tx.client.findFirst({
          where: { id: nextClientId, organizationId },
          select: { id: true }
        });

        if (!client) {
          throw new AppError(400, "Client does not belong to this organization", "INVALID_CLIENT_SCOPE");
        }
      }

      if (nextProjectId !== null) {
        const project = await tx.project.findFirst({
          where: {
            id: nextProjectId,
            organizationId,
            clientId: nextClientId
          },
          select: { id: true }
        });

        if (!project) {
          throw new AppError(
            400,
            "Project must belong to the same organization and client",
            "INVALID_PROJECT_SCOPE"
          );
        }
      }

      const nextSubtotal = input.subtotal !== undefined ? toMoneyDecimal(input.subtotal) : existing.subtotal;
      const nextTax = input.tax !== undefined ? toMoneyDecimal(input.tax) : existing.tax;
      const nextTotal = input.total !== undefined ? toMoneyDecimal(input.total) : existing.total;
      assertMoneyTotal(nextSubtotal, nextTax, nextTotal);

      try {
        const result = await tx.invoice.updateMany({
          where: {
            id: invoiceId,
            organizationId,
            status: InvoiceStatus.DRAFT
          },
          data: {
            ...(input.clientId !== undefined ? { clientId: input.clientId } : {}),
            ...(input.projectId !== undefined ? { projectId: input.projectId } : {}),
            ...(input.invoiceNumber !== undefined ? { invoiceNumber: input.invoiceNumber.toUpperCase() } : {}),
            ...(input.currency !== undefined ? { currency: input.currency.toUpperCase() } : {}),
            ...(input.subtotal !== undefined ? { subtotal: nextSubtotal } : {}),
            ...(input.tax !== undefined ? { tax: nextTax } : {}),
            ...(input.total !== undefined ? { total: nextTotal } : {}),
            ...(input.dueDate !== undefined ? { dueDate: input.dueDate } : {})
          }
        });

        if (result.count === 0) {
          const current = await tx.invoice.findFirst({
            where: {
              id: invoiceId,
              organizationId
            },
            select: {
              id: true,
              status: true
            }
          });

          if (!current) {
            throw new AppError(404, "Invoice not found", "INVOICE_NOT_FOUND");
          }

          throw new AppError(409, "Only DRAFT invoices can be updated", "INVALID_INVOICE_STATE");
        }

        const invoice = await tx.invoice.findFirst({
          where: { id: invoiceId, organizationId }
        });

        if (!invoice) {
          throw new AppError(404, "Invoice not found", "INVOICE_NOT_FOUND");
        }

        await auditLogService.record(tx, {
          organizationId,
          actorUserId,
          entityType: AuditEntityType.INVOICE,
          entityId: invoice.id,
          action: AuditAction.INVOICE_DRAFT_UPDATED,
          metadata: {
            status: invoice.status
          }
        });

        return invoice;
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2002"
        ) {
          throw new AppError(
            409,
            "Invoice number already exists in this organization",
            "INVOICE_NUMBER_EXISTS"
          );
        }

        throw error;
      }
    });
  }

  async sendInvoice(organizationId: string, invoiceId: string, actorUserId?: string) {
    return prisma.$transaction(async (tx) => {
      const result = await tx.invoice.updateMany({
        where: {
          id: invoiceId,
          organizationId,
          status: InvoiceStatus.DRAFT
        },
        data: {
          status: InvoiceStatus.SENT,
          issuedAt: new Date()
        }
      });

      if (result.count === 0) {
        const existing = await tx.invoice.findFirst({
          where: { id: invoiceId, organizationId },
          select: { id: true, status: true }
        });

        if (!existing) {
          throw new AppError(404, "Invoice not found", "INVOICE_NOT_FOUND");
        }

        throw new AppError(409, "Only DRAFT invoices can be sent", "INVALID_INVOICE_STATE");
      }

      const invoice = await tx.invoice.findFirst({
        where: { id: invoiceId, organizationId }
      });

      if (!invoice) {
        throw new AppError(404, "Invoice not found", "INVOICE_NOT_FOUND");
      }

      await auditLogService.record(tx, {
        organizationId,
        actorUserId,
        entityType: AuditEntityType.INVOICE,
        entityId: invoice.id,
        action: AuditAction.INVOICE_SENT,
        metadata: {
          status: invoice.status,
          issuedAt: invoice.issuedAt?.toISOString() ?? null
        }
      });

      return invoice;
    });
  }

  async markAsPaid(organizationId: string, invoiceId: string, actorUserId?: string) {
    return prisma.$transaction(async (tx) => {
      const result = await tx.invoice.updateMany({
        where: {
          id: invoiceId,
          organizationId,
          status: { in: [InvoiceStatus.SENT, InvoiceStatus.OVERDUE] }
        },
        data: {
          status: InvoiceStatus.PAID,
          paidAt: new Date()
        }
      });

      if (result.count === 0) {
        const existing = await tx.invoice.findFirst({
          where: { id: invoiceId, organizationId },
          select: { id: true, status: true }
        });

        if (!existing) {
          throw new AppError(404, "Invoice not found", "INVOICE_NOT_FOUND");
        }

        throw new AppError(
          409,
          "Only SENT or OVERDUE invoices can be marked as paid",
          "INVALID_INVOICE_STATE"
        );
      }

      const invoice = await tx.invoice.findFirst({
        where: { id: invoiceId, organizationId }
      });

      if (!invoice) {
        throw new AppError(404, "Invoice not found", "INVOICE_NOT_FOUND");
      }

      await auditLogService.record(tx, {
        organizationId,
        actorUserId,
        entityType: AuditEntityType.INVOICE,
        entityId: invoice.id,
        action: AuditAction.INVOICE_PAID,
        metadata: {
          status: invoice.status,
          paidAt: invoice.paidAt?.toISOString() ?? null
        }
      });

      return invoice;
    });
  }

  async cancelInvoice(organizationId: string, invoiceId: string, actorUserId?: string) {
    return prisma.$transaction(async (tx) => {
      const result = await tx.invoice.updateMany({
        where: {
          id: invoiceId,
          organizationId,
          status: { in: [InvoiceStatus.DRAFT, InvoiceStatus.SENT] }
        },
        data: {
          status: InvoiceStatus.CANCELLED
        }
      });

      if (result.count === 0) {
        const existing = await tx.invoice.findFirst({
          where: { id: invoiceId, organizationId },
          select: { id: true, status: true }
        });

        if (!existing) {
          throw new AppError(404, "Invoice not found", "INVOICE_NOT_FOUND");
        }

        throw new AppError(
          409,
          "Only DRAFT or SENT invoices can be cancelled",
          "INVALID_INVOICE_STATE"
        );
      }

      const invoice = await tx.invoice.findFirst({
        where: { id: invoiceId, organizationId }
      });

      if (!invoice) {
        throw new AppError(404, "Invoice not found", "INVOICE_NOT_FOUND");
      }

      await auditLogService.record(tx, {
        organizationId,
        actorUserId,
        entityType: AuditEntityType.INVOICE,
        entityId: invoice.id,
        action: AuditAction.INVOICE_CANCELLED,
        metadata: {
          status: invoice.status
        }
      });

      return invoice;
    });
  }

  async getById(organizationId: string, invoiceId: string) {
    const invoice = await prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        organizationId
      }
    });

    if (!invoice) {
      throw new AppError(404, "Invoice not found", "INVOICE_NOT_FOUND");
    }

    return invoice;
  }

  async list(organizationId: string, query: ListInvoicesQueryInput) {
    const page = query.page;
    const limit = query.limit;
    const skip = (page - 1) * limit;
    const trimmedSearch = query.search?.trim();

    const where: Prisma.InvoiceWhereInput = {
      organizationId,
      ...(query.status ? { status: query.status } : {}),
      ...(query.clientId ? { clientId: query.clientId } : {}),
      ...(trimmedSearch
        ? {
            invoiceNumber: { startsWith: trimmedSearch }
          }
        : {})
    };

    const [items, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        select: {
          id: true,
          invoiceNumber: true,
          status: true,
          currency: true,
          subtotal: true,
          tax: true,
          total: true,
          dueDate: true,
          issuedAt: true,
          paidAt: true,
          clientId: true,
          projectId: true,
          createdAt: true,
          updatedAt: true
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit
      }),
      prisma.invoice.count({ where })
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
}
