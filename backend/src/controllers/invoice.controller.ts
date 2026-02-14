import type { Request, Response } from "express";
import { InvoiceService } from "../services/invoice.service.js";
import type { InvoiceParamsInput, ListInvoicesQueryInput } from "../validators/invoice.validator.js";

const invoiceService = new InvoiceService();

export class InvoiceController {
  async createDraft(req: Request, res: Response): Promise<void> {
    const data = await invoiceService.createDraft(req.organizationId!, req.body, req.auth?.userId);
    res.status(201).json({ success: true, data });
  }

  async updateDraft(req: Request, res: Response): Promise<void> {
    const params = req.params as unknown as InvoiceParamsInput;
    const data = await invoiceService.updateDraft(req.organizationId!, params.invoiceId, req.body, req.auth?.userId);
    res.status(200).json({ success: true, data });
  }

  async sendInvoice(req: Request, res: Response): Promise<void> {
    const params = req.params as unknown as InvoiceParamsInput;
    const data = await invoiceService.sendInvoice(req.organizationId!, params.invoiceId, req.auth?.userId);
    res.status(200).json({ success: true, data });
  }

  async markAsPaid(req: Request, res: Response): Promise<void> {
    const params = req.params as unknown as InvoiceParamsInput;
    const data = await invoiceService.markAsPaid(req.organizationId!, params.invoiceId, req.auth?.userId);
    res.status(200).json({ success: true, data });
  }

  async cancelInvoice(req: Request, res: Response): Promise<void> {
    const params = req.params as unknown as InvoiceParamsInput;
    const data = await invoiceService.cancelInvoice(req.organizationId!, params.invoiceId, req.auth?.userId);
    res.status(200).json({ success: true, data });
  }

  async getById(req: Request, res: Response): Promise<void> {
    const params = req.params as unknown as InvoiceParamsInput;
    const data = await invoiceService.getById(req.organizationId!, params.invoiceId);
    res.status(200).json({ success: true, data });
  }

  async list(req: Request, res: Response): Promise<void> {
    const data = await invoiceService.list(req.organizationId!, req.query as unknown as ListInvoicesQueryInput);
    res.status(200).json({ success: true, data });
  }
}
