import { config } from "dotenv";
import { z } from "zod";

config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  JWT_ACCESS_SECRET: z.string().min(32, "JWT_ACCESS_SECRET must be at least 32 characters"),
  JWT_REFRESH_SECRET: z.string().min(32, "JWT_REFRESH_SECRET must be at least 32 characters"),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
  BCRYPT_SALT_ROUNDS: z.coerce.number().int().min(8).max(15).default(12),
  REDIS_URL: z.string().optional(),
  OVERDUE_JOB_ENABLED: z
    .enum(["true", "false"])
    .default("true")
    .transform((value) => value === "true"),
  OVERDUE_JOB_INTERVAL_MS: z.coerce.number().int().min(60_000).default(900_000),
  OVERDUE_JOB_ORG_BATCH_SIZE: z.coerce.number().int().min(1).max(500).default(50),
  OVERDUE_JOB_INVOICE_BATCH_SIZE: z.coerce.number().int().min(1).max(500).default(100),
  OVERDUE_JOB_STARTUP_DELAY_MS: z.coerce.number().int().min(0).default(5_000)
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error("Invalid environment variables:", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
