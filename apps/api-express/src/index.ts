import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { checkDbConnection } from "./db/pool.js";
import { redis } from "./config/redis.js";

async function bootstrap() {
  logger.info("🚀 Starting Smart Climate Engine – API Gateway");

  // Connect dependencies
  await redis.connect();
  logger.info("✅ Redis connected");

  await checkDbConnection();
  logger.info("✅ Database connected");

  const app = createApp();

  const server = app.listen(env.PORT, () => {
    logger.info(`✅ API Gateway listening on http://0.0.0.0:${env.PORT}`);
    logger.info(`   Environment : ${env.NODE_ENV}`);
    logger.info(`   ML Service  : ${env.ML_SERVICE_URL}`);
  });

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    logger.info(`📴 ${signal} received — shutting down gracefully`);
    server.close(async () => {
      await redis.quit();
      logger.info("✅ Shutdown complete");
      process.exit(0);
    });
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

bootstrap().catch((err) => {
  console.error("Fatal startup error:", err);
  process.exit(1);
});
