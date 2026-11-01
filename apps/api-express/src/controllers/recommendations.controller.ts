import { Request, Response } from "express";
import { z } from "zod";
import { env } from "../config/env.js";
import { pool } from "../db/pool.js";
import { AppError } from "../middleware/errorHandler.js";

const generateSchema = z.object({
  scenario_id: z.string().uuid(),
  priorities: z.object({
    resilience: z.number().min(0).max(1).default(0.4),
    cost: z.number().min(0).max(1).default(0.3),
    environment: z.number().min(0).max(1).default(0.2),
    feasibility: z.number().min(0).max(1).default(0.1),
  }).optional(),
  budget_constraint: z.number().positive().optional(),
});

// POST /api/v1/recommendations/generate
export async function generateRecommendation(req: Request, res: Response): Promise<void> {
  const body = generateSchema.parse(req.body);

  // Check scenario exists
  const scenarioRes = await pool.query(
    "SELECT * FROM scenarios.scenarios WHERE id = $1",
    [body.scenario_id],
  );
  if (scenarioRes.rowCount === 0) throw new AppError(404, "Scenario not found");

  // Call ML service for optimization + Nugen AI explanation
  const mlRes = await fetch(`${env.ML_SERVICE_URL}/optimization/recommend`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      scenario: scenarioRes.rows[0],
      priorities: body.priorities,
      budget_constraint: body.budget_constraint,
    }),
  });

  if (!mlRes.ok) {
    const err = await mlRes.text();
    throw new AppError(502, `ML service error: ${err}`);
  }

  const mlData = (await mlRes.json()) as {
    recommended: unknown;
    scores: unknown;
    explanation: string;
  };

  // Persist recommendation
  const saved = await pool.query(
    `INSERT INTO decisions.recommendations (scenario_id, recommended, scores, explanation)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [
      body.scenario_id,
      JSON.stringify(mlData.recommended),
      JSON.stringify(mlData.scores),
      mlData.explanation,
    ],
  );

  res.status(201).json({ success: true, data: saved.rows[0] });
}

// GET /api/v1/recommendations/:id
export async function getRecommendation(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const result = await pool.query(
    "SELECT * FROM decisions.recommendations WHERE id = $1",
    [id],
  );
  if (result.rowCount === 0) throw new AppError(404, "Recommendation not found");
  res.json({ success: true, data: result.rows[0] });
}

// GET /api/v1/recommendations  (list by scenario)
export async function listRecommendations(req: Request, res: Response): Promise<void> {
  const { scenario_id } = z.object({ scenario_id: z.string().uuid().optional() }).parse(req.query);

  const result = scenario_id
    ? await pool.query(
        "SELECT * FROM decisions.recommendations WHERE scenario_id = $1 ORDER BY created_at DESC",
        [scenario_id],
      )
    : await pool.query("SELECT * FROM decisions.recommendations ORDER BY created_at DESC LIMIT 20");

  res.json({ success: true, data: result.rows });
}
