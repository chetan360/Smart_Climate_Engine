import { Request, Response } from "express";
import { z } from "zod";
import { env } from "../config/env.js";
import { pool } from "../db/pool.js";
import { redis } from "../config/redis.js";
import { AppError } from "../middleware/errorHandler.js";

// ---- Validation schemas ----
const createScenarioSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  region: z.object({
    type: z.literal("Polygon"),
    coordinates: z.array(z.array(z.tuple([z.number(), z.number()]))),
  }),
  budget: z.number().positive(),
  interventions: z.array(z.string()).min(1),
});

const CACHE_TTL = 60; // seconds

// GET /api/v1/scenarios
export async function listScenarios(req: Request, res: Response): Promise<void> {
  const cacheKey = "scenarios:list";
  const cached = await redis.get(cacheKey);

  if (cached) {
    res.json({ success: true, data: JSON.parse(cached), source: "cache" });
    return;
  }

  const result = await pool.query(
    "SELECT id, name, description, budget, interventions, created_at FROM scenarios.scenarios ORDER BY created_at DESC LIMIT 50",
  );

  await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(result.rows));
  res.json({ success: true, data: result.rows });
}

// GET /api/v1/scenarios/:id
export async function getScenario(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const cacheKey = `scenarios:${id}`;
  const cached = await redis.get(cacheKey);

  if (cached) {
    res.json({ success: true, data: JSON.parse(cached), source: "cache" });
    return;
  }

  const result = await pool.query(
    "SELECT * FROM scenarios.scenarios WHERE id = $1",
    [id],
  );

  if (result.rowCount === 0) throw new AppError(404, "Scenario not found");

  await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(result.rows[0]));
  res.json({ success: true, data: result.rows[0] });
}

// POST /api/v1/scenarios
export async function createScenario(req: Request, res: Response): Promise<void> {
  const body = createScenarioSchema.parse(req.body);

  const result = await pool.query(
    `INSERT INTO scenarios.scenarios (name, description, budget, interventions)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [body.name, body.description ?? null, body.budget, JSON.stringify(body.interventions)],
  );

  // Invalidate list cache
  await redis.del("scenarios:list");

  res.status(201).json({ success: true, data: result.rows[0] });
}

// POST /api/v1/scenarios/:id/simulate
// Proxies to the Python ML service for heavy computation
export async function simulateScenario(req: Request, res: Response): Promise<void> {
  const { id } = req.params;

  // Verify scenario exists
  const scenario = await pool.query(
    "SELECT * FROM scenarios.scenarios WHERE id = $1",
    [id],
  );
  if (scenario.rowCount === 0) throw new AppError(404, "Scenario not found");

  // Forward to ML service
  const mlRes = await fetch(`${env.ML_SERVICE_URL}/scenario-engine/simulate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ scenario_id: id, ...scenario.rows[0] }),
  });

  if (!mlRes.ok) {
    throw new AppError(502, "ML service simulation failed");
  }

  const mlData = await mlRes.json();
  res.json({ success: true, data: mlData });
}
