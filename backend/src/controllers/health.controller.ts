import type { Request, Response } from "express";
import { prisma } from "../config/prisma.js";

export class HealthController {
  async check(_req: Request, res: Response): Promise<void> {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      success: true,
      data: {
        status: "ok",
        timestamp: new Date().toISOString()
      }
    });
  }
}
