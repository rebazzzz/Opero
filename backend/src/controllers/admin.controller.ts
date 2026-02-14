import type { Request, Response } from "express";
import { AdminService } from "../services/admin.service.js";
import type {
  FeatureModuleParamsInput,
  ListAuditLogsQueryInput,
  UserParamsInput
} from "../validators/admin.validator.js";

const adminService = new AdminService();

export class AdminController {
  async listAuditLogs(req: Request, res: Response): Promise<void> {
    const data = await adminService.listAuditLogs(
      req.organizationId!,
      req.query as unknown as ListAuditLogsQueryInput
    );
    res.status(200).json({ success: true, data });
  }

  async updateUserRole(req: Request, res: Response): Promise<void> {
    const params = req.params as unknown as UserParamsInput;
    const data = await adminService.updateUserRole(
      req.organizationId!,
      req.auth!.userId,
      params.userId,
      req.body
    );

    res.status(200).json({ success: true, data });
  }

  async updateFeatureModule(req: Request, res: Response): Promise<void> {
    const params = req.params as unknown as FeatureModuleParamsInput;
    const data = await adminService.updateFeatureModule(
      req.organizationId!,
      req.auth!.userId,
      params.moduleName,
      req.body
    );

    res.status(200).json({ success: true, data });
  }
}
