import "express-async-errors";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "./config/env.js";
import { requestLogger } from "./middleware/requestLogger.js";
import { rateLimiter } from "./middleware/rateLimiter.js";
import { errorHandler } from "./middleware/errorHandler.js";
import router from "./routes/index.js";

export function createApp() {
  const app = express();

  // ---- Security ----
  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGINS.split(",").map((o) => o.trim()),
      credentials: true,
    }),
  );

  // ---- Parsing ----
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true }));

  // ---- Logging ----
  app.use(requestLogger);

  // ---- Rate limiting ----
  app.use(rateLimiter);

  // ---- Routes ----
  app.use(router);

  // ---- 404 ----
  app.use((_req, res) => {
    res.status(404).json({ error: "Route not found" });
  });

  // ---- Error handler (must be last) ----
  app.use(errorHandler);

  return app;
}
