import { Request, Response } from "express";
import { z } from "zod";
import { pool } from "../db/pool.js";
import { redis } from "../config/redis.js";

const querySchema = z.object({
  variable: z.string().optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
  radius_km: z.coerce.number().positive().default(10),
  limit: z.coerce.number().int().positive().max(500).default(100),
});

// GET /api/v1/environmental/data
export async function getEnvironmentalData(req: Request, res: Response): Promise<void> {
  const query = querySchema.parse(req.query);

  const cacheKey = `env:data:${JSON.stringify(query)}`;
  const cached = await redis.get(cacheKey);
  if (cached) {
    res.json({ success: true, data: JSON.parse(cached), source: "cache" });
    return;
  }

  const conditions: string[] = [];
  const params: unknown[] = [];
  let idx = 1;

  if (query.variable) {
    conditions.push(`variable = $${idx++}`);
    params.push(query.variable);
  }
  if (query.from) {
    conditions.push(`recorded_at >= $${idx++}`);
    params.push(query.from);
  }
  if (query.to) {
    conditions.push(`recorded_at <= $${idx++}`);
    params.push(query.to);
  }
  if (query.lat !== undefined && query.lng !== undefined) {
    conditions.push(
      `ST_DWithin(location::geography, ST_MakePoint($${idx++}, $${idx++})::geography, $${idx++})`,
    );
    params.push(query.lng, query.lat, query.radius_km * 1000);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  params.push(query.limit);

  const sql = `
    SELECT id, source, variable, value, unit,
           ST_AsGeoJSON(location)::json AS location,
           recorded_at
    FROM environmental.data_points
    ${where}
    ORDER BY recorded_at DESC
    LIMIT $${idx}
  `;

  const result = await pool.query(sql, params);
  await redis.setex(cacheKey, 30, JSON.stringify(result.rows));

  res.json({ success: true, data: result.rows, total: result.rowCount });
}

// GET /api/v1/environmental/summary
export async function getEnvironmentalSummary(_req: Request, res: Response): Promise<void> {
  const cacheKey = "env:summary";
  const cached = await redis.get(cacheKey);
  if (cached) {
    res.json({ success: true, data: JSON.parse(cached), source: "cache" });
    return;
  }

  const result = await pool.query(`
    SELECT
      variable,
      COUNT(*)         AS count,
      AVG(value)       AS avg_value,
      MIN(value)       AS min_value,
      MAX(value)       AS max_value,
      MAX(recorded_at) AS latest_at
    FROM environmental.data_points
    GROUP BY variable
    ORDER BY variable
  `);

  await redis.setex(cacheKey, 60, JSON.stringify(result.rows));
  res.json({ success: true, data: result.rows });
}
