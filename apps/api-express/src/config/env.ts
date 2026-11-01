import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(4000),

  // Database
  DATABASE_URL: z.string().default("postgresql://climate_user:change_me_in_production@localhost:5432/climate_db"),

  // Redis
  REDIS_URL: z.string().default("redis://:change_me_in_production@localhost:6379/0"),

  // ML Service (FastAPI)
  ML_SERVICE_URL: z.string().default("http://ml-service:8000"),

  // Nugen AI
  NUGEN_API_KEY: z.string().optional(),
  NUGEN_BASE_URL: z.string().default("https://api.nugen.ai"),

  // CORS
  CORS_ORIGINS: z.string().default("http://localhost:3000"),

  // Rate limiting
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60_000),
  RATE_LIMIT_MAX: z.coerce.number().default(100),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:");
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
export type Env = typeof env;
