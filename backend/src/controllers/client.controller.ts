import type { Request, Response } from "express";
import { ClientService } from "../services/client.service.js";
import type { ClientParamsInput, ListClientsQueryInput } from "../validators/client.validator.js";

const clientService = new ClientService();

export class ClientController {
  async create(req: Request, res: Response): Promise<void> {
    const data = await clientService.create(req.organizationId!, req.body);
    res.status(201).json({ success: true, data });
  }

  async list(req: Request, res: Response): Promise<void> {
    const data = await clientService.list(req.organizationId!, req.query as unknown as ListClientsQueryInput);
    res.status(200).json({ success: true, data });
  }

  async getById(req: Request, res: Response): Promise<void> {
    const params = req.params as unknown as ClientParamsInput;
    const data = await clientService.getById(req.organizationId!, params.clientId);
    res.status(200).json({ success: true, data });
  }

  async update(req: Request, res: Response): Promise<void> {
    const params = req.params as unknown as ClientParamsInput;
    const data = await clientService.update(req.organizationId!, params.clientId, req.body);
    res.status(200).json({ success: true, data });
  }
}
