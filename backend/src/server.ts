import { app } from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { prisma } from "./config/prisma.js";
import { InvoiceOverdueService } from "./services/invoice-overdue.service.js";

const overdueService = new InvoiceOverdueService();
let overdueJobTimer: NodeJS.Timeout | null = null;
let overdueStartupTimer: NodeJS.Timeout | null = null;

const runOverdueJob = (): void => {
  void overdueService.runOnce().catch((error: unknown) => {
    logger.error({ err: error }, "Overdue job failed");
  });
};

const server = app.listen(env.PORT, () => {
  logger.info({ port: env.PORT, env: env.NODE_ENV }, "Server started");

  if (env.OVERDUE_JOB_ENABLED) {
    overdueStartupTimer = setTimeout(runOverdueJob, env.OVERDUE_JOB_STARTUP_DELAY_MS);
    overdueJobTimer = setInterval(runOverdueJob, env.OVERDUE_JOB_INTERVAL_MS);

    logger.info(
      {
        intervalMs: env.OVERDUE_JOB_INTERVAL_MS,
        orgBatchSize: env.OVERDUE_JOB_ORG_BATCH_SIZE,
        invoiceBatchSize: env.OVERDUE_JOB_INVOICE_BATCH_SIZE
      },
      "Overdue job scheduler started"
    );
  } else {
    logger.info("Overdue job scheduler disabled by configuration");
  }
});

const shutdown = async (signal: string): Promise<void> => {
  logger.info({ signal }, "Graceful shutdown initiated");

  if (overdueStartupTimer) {
    clearTimeout(overdueStartupTimer);
    overdueStartupTimer = null;
  }
  if (overdueJobTimer) {
    clearInterval(overdueJobTimer);
    overdueJobTimer = null;
  }

  server.close(async () => {
    await prisma.$disconnect();
    logger.info("HTTP server closed");
    process.exit(0);
  });
};

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});
