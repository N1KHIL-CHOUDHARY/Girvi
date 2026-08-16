import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  DIRECT_URL: z.string().min(1).optional(),
  REDIS_URL: z.string().url().default("redis://127.0.0.1:6379"),
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  JWT_REFRESH_SECRET: z.string().min(32, "JWT_REFRESH_SECRET must be at least 32 characters"),
  JWT_EXPIRES: z.string().default("15m"),
  REFRESH_EXPIRES: z.string().default("7d"),
  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  SMTP_HOST: z.string().default("smtp.gmail.com"),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  SMTP_SECURE: z.coerce.boolean().default(false),
  SMTP_FROM: z.string().default("Pawn Manager <no-reply@pawnmanager.com>"),
  FRONTEND_URL: z.string().url().default("http://localhost:3000"),
  ENCRYPTION_KEY: z.string().length(64, "ENCRYPTION_KEY must be a 64-character hex string"),
  DB_DAILY_PING_ENABLED: z.coerce.boolean().default(true),
  DB_DAILY_PING_INTERVAL_HOURS: z.coerce.number().default(24),
  DB_DAILY_PING_CRON: z.string().default("0 0 * * *"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const formattedError = JSON.stringify(parsed.error.format(), null, 2);
  throw new Error(`Fatal Environment Error: Invalid configuration.\n${formattedError}`);
}

export const env = parsed.data;
export type EnvType = z.infer<typeof envSchema>;
