import { Request, Response } from "express";
import { pool } from "../db/pool.js";
import { redis } from "../config/redis.js";
import { HealthStatus } from "../types/index.js";

export async function getHealth(_req: Request, res: Response): Promise<void> {
  const services: Record<string, "up" | "down"> = {};

  // Check DB
  try {
    await pool.query("SELECT 1");
    services.database = "up";
  } catch {
    services.database = "down";
  }

  // Check Redis
  try {
    await redis.ping();
    services.redis = "up";
  } catch {
    services.redis = "down";
  }

  const allHealthy = Object.values(services).every((s) => s === "up");

  const payload: HealthStatus = {
    status: allHealthy ? "healthy" : "degraded",
    version: process.env.npm_package_version ?? "0.1.0",
    services,
    timestamp: new Date().toISOString(),
  };

  res.status(allHealthy ? 200 : 503).json(payload);
}
