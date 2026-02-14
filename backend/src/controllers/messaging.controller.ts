import type { Request, Response } from "express";
import { MessagingService } from "../services/messaging.service.js";
import { emitMessageNew } from "../sockets/messaging.socket.js";
import type { SendMessageInput, ThreadParamsInput } from "../validators/messaging.validator.js";

const messagingService = new MessagingService();

export class MessagingController {
  async listMessages(req: Request, res: Response): Promise<void> {
    const params = req.params as unknown as ThreadParamsInput;
    const data = await messagingService.getThread(params.threadId, req.organizationId!);
    res.status(200).json({ success: true, data });
  }

  async sendMessage(req: Request, res: Response): Promise<void> {
    const body = req.body as SendMessageInput;
    const { organizationId, message } = await messagingService.createMessage(
      body.threadId,
      req.auth!.userId,
      body.content
    );

    emitMessageNew(organizationId, { message });
    res.status(201).json({ success: true, data: message });
  }
}
