import dotenv from "dotenv";
import { z } from "zod";

// Load environment variables from .env
dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(5001),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  MONGODB_URI: z.string().url("MONGODB_URI must be a valid connection string"),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000), // 15 mins
  RATE_LIMIT_MAX: z.coerce.number().default(100),
  JWT_SECRET: z.string().min(8, "JWT_SECRET must be at least 8 characters long"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  UPLOAD_DIR: z.string().min(1, "UPLOAD_DIR is required"),
  HOSTED_DIR: z.string().min(1, "HOSTED_DIR is required"),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  // eslint-disable-next-line no-console
  console.error("❌ Invalid environment configuration:");
  result.error.errors.forEach((err) => {
    // eslint-disable-next-line no-console
    console.error(`   - ${err.path.join(".")}: ${err.message}`);
  });
  process.exit(1);
}

export const env = result.data;
