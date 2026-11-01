import { Pool } from "pg";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});

pool.on("error", (err) => {
  logger.error({ err }, "Unexpected database pool error");
});

export async function checkDbConnection(): Promise<void> {
  const client = await pool.connect();
  await client.query("SELECT 1");
  client.release();
}
