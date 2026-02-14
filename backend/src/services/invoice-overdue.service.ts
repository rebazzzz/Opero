import { InvoiceStatus } from "@prisma/client";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import { prisma } from "../config/prisma.js";

const OVERDUE_JOB_ADVISORY_LOCK_KEY = 8_237_711;

interface OverdueRunMetrics {
  skipped: boolean;
  organizationsScanned: number;
  organizationsUpdated: number;
  batchesProcessed: number;
  invoicesUpdated: number;
  durationMs: number;
}

export class InvoiceOverdueService {
  async runOnce(): Promise<OverdueRunMetrics> {
    const startedAt = Date.now();
    const baseMetrics: OverdueRunMetrics = {
      skipped: false,
      organizationsScanned: 0,
      organizationsUpdated: 0,
      batchesProcessed: 0,
      invoicesUpdated: 0,
      durationMs: 0
    };

    const lockRows = await prisma.$queryRaw<Array<{ locked: boolean }>>`
      SELECT pg_try_advisory_lock(${OVERDUE_JOB_ADVISORY_LOCK_KEY}) AS locked
    `;
    const lockAcquired = lockRows[0]?.locked === true;

    if (!lockAcquired) {
      const metrics = { ...baseMetrics, skipped: true, durationMs: Date.now() - startedAt };
      logger.info({ metrics }, "Overdue job skipped because another run holds the lock");
      return metrics;
    }

    try {
      let orgCursor: string | null = null;

      while (true) {
        const organizations: Array<{ id: string }> = await prisma.organization.findMany({
          where: orgCursor ? { id: { gt: orgCursor } } : undefined,
          select: { id: true },
          orderBy: { id: "asc" },
          take: env.OVERDUE_JOB_ORG_BATCH_SIZE
        });

        if (organizations.length === 0) {
          break;
        }

        for (const organization of organizations) {
          baseMetrics.organizationsScanned += 1;
          const organizationUpdated = await this.processOrganization(organization.id, baseMetrics);
          if (organizationUpdated) {
            baseMetrics.organizationsUpdated += 1;
          }
        }

        orgCursor = organizations[organizations.length - 1].id;
      }

      const metrics = { ...baseMetrics, durationMs: Date.now() - startedAt };
      logger.info({ metrics }, "Overdue job completed");
      return metrics;
    } finally {
      await prisma.$queryRaw`
        SELECT pg_advisory_unlock(${OVERDUE_JOB_ADVISORY_LOCK_KEY})
      `;
    }
  }

  private async processOrganization(
    organizationId: string,
    metrics: OverdueRunMetrics
  ): Promise<boolean> {
    let invoiceCursor: string | null = null;
    let organizationUpdated = false;

    while (true) {
      const overdueCandidates: Array<{ id: string }> = await prisma.invoice.findMany({
        where: {
          organizationId,
          status: InvoiceStatus.SENT,
          dueDate: { lt: new Date() },
          ...(invoiceCursor ? { id: { gt: invoiceCursor } } : {})
        },
        select: { id: true },
        orderBy: { id: "asc" },
        take: env.OVERDUE_JOB_INVOICE_BATCH_SIZE
      });

      if (overdueCandidates.length === 0) {
        break;
      }

      const invoiceIds = overdueCandidates.map((invoice: { id: string }) => invoice.id);
      const updateResult = await prisma.invoice.updateMany({
        where: {
          organizationId,
          id: { in: invoiceIds },
          status: InvoiceStatus.SENT,
          dueDate: { lt: new Date() }
        },
        data: {
          status: InvoiceStatus.OVERDUE
        }
      });

      metrics.batchesProcessed += 1;
      metrics.invoicesUpdated += updateResult.count;

      if (updateResult.count > 0) {
        organizationUpdated = true;
      }

      invoiceCursor = overdueCandidates[overdueCandidates.length - 1].id;
    }

    return organizationUpdated;
  }
}
