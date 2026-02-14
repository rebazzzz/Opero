import type { Request, Response } from "express";
import { ProjectService } from "../services/project.service.js";
import type {
  ListProjectsQueryInput,
  ProjectParamsInput
} from "../validators/project.validator.js";

const projectService = new ProjectService();

export class ProjectController {
  async create(req: Request, res: Response): Promise<void> {
    const data = await projectService.create(req.organizationId!, req.body);
    res.status(201).json({ success: true, data });
  }

  async list(req: Request, res: Response): Promise<void> {
    const data = await projectService.list(
      req.organizationId!,
      req.query as unknown as ListProjectsQueryInput
    );
    res.status(200).json({ success: true, data });
  }

  async getById(req: Request, res: Response): Promise<void> {
    const params = req.params as unknown as ProjectParamsInput;
    const data = await projectService.getById(req.organizationId!, params.projectId);
    res.status(200).json({ success: true, data });
  }

  async update(req: Request, res: Response): Promise<void> {
    const params = req.params as unknown as ProjectParamsInput;
    const data = await projectService.update(req.organizationId!, params.projectId, req.body);
    res.status(200).json({ success: true, data });
  }
}
