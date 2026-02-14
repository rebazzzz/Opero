import { UserRole } from "@prisma/client";
import { Router } from "express";
import { InvoiceController } from "../controllers/invoice.controller.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorizeRoles } from "../middlewares/authorize-roles.js";
import { organizationScope } from "../middlewares/organization-scope.js";
import { validateRequest } from "../middlewares/validate-request.js";
import { asyncHandler } from "../utils/async-handler.js";
import {
  createDraftInvoiceSchema,
  invoiceParamsSchema,
  listInvoicesQuerySchema,
  updateDraftInvoiceSchema
} from "../validators/invoice.validator.js";

const router = Router();
const invoiceController = new InvoiceController();

router.use(authenticate, organizationScope, authorizeRoles(UserRole.ADMIN, UserRole.MEMBER));

router.post(
  "/drafts",
  validateRequest({ body: createDraftInvoiceSchema }),
  asyncHandler(invoiceController.createDraft.bind(invoiceController))
);

router.patch(
  "/:invoiceId/draft",
  validateRequest({ params: invoiceParamsSchema, body: updateDraftInvoiceSchema }),
  asyncHandler(invoiceController.updateDraft.bind(invoiceController))
);

router.post(
  "/:invoiceId/send",
  validateRequest({ params: invoiceParamsSchema }),
  asyncHandler(invoiceController.sendInvoice.bind(invoiceController))
);

router.post(
  "/:invoiceId/pay",
  validateRequest({ params: invoiceParamsSchema }),
  asyncHandler(invoiceController.markAsPaid.bind(invoiceController))
);

router.post(
  "/:invoiceId/cancel",
  validateRequest({ params: invoiceParamsSchema }),
  asyncHandler(invoiceController.cancelInvoice.bind(invoiceController))
);

router.get(
  "/:invoiceId",
  validateRequest({ params: invoiceParamsSchema }),
  asyncHandler(invoiceController.getById.bind(invoiceController))
);

router.get(
  "/",
  validateRequest({ query: listInvoicesQuerySchema }),
  asyncHandler(invoiceController.list.bind(invoiceController))
);

export { router as invoiceRoutes };
