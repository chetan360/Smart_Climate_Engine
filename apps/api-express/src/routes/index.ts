import { Router, Request, Response } from "express";
import { getHealth } from "../controllers/health.controller.js";
import {
  listScenarios,
  getScenario,
  createScenario,
  simulateScenario,
} from "../controllers/scenarios.controller.js";
import {
  getEnvironmentalData,
  getEnvironmentalSummary,
} from "../controllers/environmental.controller.js";
import {
  generateRecommendation,
  getRecommendation,
  listRecommendations,
} from "../controllers/recommendations.controller.js";
import { env } from "../config/env.js";

const router = Router();

// ---- Health ----
router.get("/health", getHealth);

// ---- Environmental data ----
router.get("/api/v1/environmental/data", getEnvironmentalData);
router.get("/api/v1/environmental/summary", getEnvironmentalSummary);

// ---- Scenarios ----
router.get("/api/v1/scenarios", listScenarios);
router.post("/api/v1/scenarios", createScenario);
router.get("/api/v1/scenarios/:id", getScenario);
router.post("/api/v1/scenarios/:id/simulate", simulateScenario);

// ---- AI Recommendations ----
router.get("/api/v1/recommendations", listRecommendations);
router.post("/api/v1/recommendations/generate", generateRecommendation);
router.get("/api/v1/recommendations/:id", getRecommendation);

// ---- Full Decision Intelligence Pipeline ----
router.post("/api/v1/decision/pipeline", async (req: Request, res: Response) => {
  try {
    const mlRes = await fetch(`${env.ML_SERVICE_URL}/api/v1/decision/pipeline`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });
    if (!mlRes.ok) {
      const err = await mlRes.text();
      res.status(mlRes.status).json({ success: false, error: err });
      return;
    }
    const data = await mlRes.json();
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(502).json({ success: false, error: `Failed to reach ML service: ${err.message}` });
  }
});

export default router;
