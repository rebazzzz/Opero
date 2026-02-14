import type { Request, Response } from "express";
import { AuthService } from "../services/auth.service.js";

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    const data = await authService.register(req.body);
    res.status(201).json({ success: true, data });
  }

  async login(req: Request, res: Response): Promise<void> {
    const data = await authService.login(req.body);
    res.status(200).json({ success: true, data });
  }

  async refresh(req: Request, res: Response): Promise<void> {
    const data = await authService.refresh(req.body);
    res.status(200).json({ success: true, data });
  }

  async logout(req: Request, res: Response): Promise<void> {
    const data = await authService.logout(req.body);
    res.status(200).json({ success: true, data });
  }

  async me(req: Request, res: Response): Promise<void> {
    const data = await authService.me(req.auth!.userId);
    res.status(200).json({ success: true, data });
  }
}
