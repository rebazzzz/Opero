import type { Request, Response } from "express";
import { DashboardService } from "../services/dashboard.service.js";

const dashboardService = new DashboardService();

export class DashboardController {
  async summary(req: Request, res: Response): Promise<void> {
    const data = await dashboardService.getSummary(req.organizationId!);
    res.status(200).json({ success: true, data });
  }
}
