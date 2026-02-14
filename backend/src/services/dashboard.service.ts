import { InvoiceStatus, ProjectStatus } from "@prisma/client";
import { prisma } from "../config/prisma.js";

interface DashboardSummary {
  totalProjects: number;
  activeProjects: number;
  totalClients: number;
  unpaidInvoices: number;
  revenueThisMonth: number;
  unreadNotifications: number;
}

export class DashboardService {
  async getSummary(organizationId: string): Promise<DashboardSummary> {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const [
      totalProjects,
      activeProjects,
      totalClients,
      unpaidInvoices,
      revenueAggregate,
      unreadNotifications
    ] = await Promise.all([
      prisma.project.count({
        where: { organizationId }
      }),
      prisma.project.count({
        where: {
          organizationId,
          status: { not: ProjectStatus.COMPLETED }
        }
      }),
      prisma.client.count({
        where: { organizationId }
      }),
      prisma.invoice.count({
        where: {
          organizationId,
          status: { not: InvoiceStatus.PAID }
        }
      }),
      prisma.invoice.aggregate({
        where: {
          organizationId,
          createdAt: {
            gte: monthStart,
            lt: nextMonthStart
          }
        },
        _sum: {
          total: true
        }
      }),
      prisma.notification.count({
        where: {
          read: false,
          user: {
            organizationId
          }
        }
      })
    ]);

    return {
      totalProjects,
      activeProjects,
      totalClients,
      unpaidInvoices,
      revenueThisMonth: Number(revenueAggregate._sum.total ?? 0),
      unreadNotifications
    };
  }
}
