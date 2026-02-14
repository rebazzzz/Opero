import type { NextFunction, Request, Response } from "express";
import type { ZodTypeAny } from "zod";

interface RequestSchemas {
  body?: ZodTypeAny;
  params?: ZodTypeAny;
  query?: ZodTypeAny;
}

export const validateRequest = (schemas: RequestSchemas) => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (schemas.body) {
        req.body = await schemas.body.parseAsync(req.body);
      }

      if (schemas.params) {
        req.params = (await schemas.params.parseAsync(req.params)) as Request["params"];
      }

      if (schemas.query) {
        req.query = (await schemas.query.parseAsync(req.query)) as Request["query"];
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
