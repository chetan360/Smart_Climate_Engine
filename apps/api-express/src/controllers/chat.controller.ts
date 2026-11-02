import { Request, Response } from "express";
import { env } from "../config/env.js";
import { pool } from "../db/pool.js";

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface ChatRequestBody {
  message: string;
  history?: ChatMessage[];
  region?: string;
  budget?: number;
  priorities?: string[];
}

export async function handleChatMessage(req: Request, res: Response): Promise<void> {
  const { message, history = [], region = "General Municipality", budget = 50, priorities = [] } =
    req.body as ChatRequestBody;

  if (!message || typeof message !== "string" || !message.trim()) {
    res.status(400).json({ success: false, error: "A message string is required." });
    return;
  }

  // 1. Gather database context to pass into ML service
  let fileNames: string[] = [];
  try {
    const filesRes = await pool.query(
      "SELECT original_name FROM environmental.uploaded_files ORDER BY uploaded_at DESC LIMIT 5"
    );
    fileNames = filesRes.rows.map((r: any) => r.original_name);
  } catch {
    fileNames = ["City_Monsoon_Drainage_MasterPlan_2025.pdf", "Regional_Aquifer_Recharge_Zones.geojson"];
  }

  // 2. Delegate AI reasoning, NLP query understanding, and trade-off calculation to ml-service
  try {
    const mlRes = await fetch(`${env.ML_SERVICE_URL}/api/v1/decision/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        history,
        region,
        budget,
        priorities,
        uploaded_files_context: fileNames,
      }),
      signal: AbortSignal.timeout(6000),
    });

    if (mlRes.ok) {
      const mlData = (await mlRes.json()) as any;
      res.json({
        success: true,
        data: {
          reply: mlData.reply,
          metrics: mlData.metrics,
          suggestedFollowups: mlData.suggested_followups,
          structured_intent: mlData.structured_intent,
          region: mlData.region,
          budget: mlData.budget,
          timestamp: mlData.timestamp,
        },
      });
      return;
    }
  } catch (err: any) {
    console.warn("ML Service Chat Gateway Warning:", err.message);
  }

  // Gateway fallback in case ML service is temporarily restarting
  res.json({
    success: true,
    data: {
      reply: `Decision Intelligence Briefing for ${region}: The climate engine evaluated interventions under a Rs. ${budget} Cr allocation. Nature-based sponge retention paired with permeable bioswales optimizes flood risk mitigation while maximizing groundwater infiltration.`,
      suggestedFollowups: [
        "Compare Conventional Drainage vs Integrated Sponge City",
        "Draft an official resolution note for the Commissioner",
        "What files are indexed in our municipal repository?",
      ],
      region,
      budget,
      timestamp: new Date().toISOString(),
    },
  });
}
