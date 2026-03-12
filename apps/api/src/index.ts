import Fastify from "fastify";
import cors from "@fastify/cors";
import fjwt from "@fastify/jwt";
import { errorHandler } from "./middleware/error-handler.js";
import { authRoutes } from "./routes/auth.js";
import { dailyRoutes } from "./routes/daily.js";
import { ticketRoutes } from "./routes/tickets.js";
import { summaryRoutes } from "./routes/summary.js";

const envToLogger: Record<string, object | boolean> = {
  development: {
    transport: {
      target: "pino-pretty",
      options: { translateTime: "HH:MM:ss Z", ignore: "pid,hostname" },
    },
  },
  production: true,
  test: false,
};

const nodeEnv = process.env.NODE_ENV ?? "development";

async function buildApp() {
  const app = Fastify({
    logger: envToLogger[nodeEnv] ?? true,
  });

  await app.register(cors, {
    origin: process.env.CORS_ORIGIN ?? "http://localhost:5173",
    credentials: true,
  });

  await app.register(fjwt, {
    secret: process.env.JWT_SECRET ?? "change-me-in-production",
  });

  app.setErrorHandler(errorHandler);

  await app.register(authRoutes, { prefix: "/auth" });
  await app.register(dailyRoutes, { prefix: "/daily" });
  await app.register(ticketRoutes, { prefix: "/tickets" });
  await app.register(summaryRoutes, { prefix: "/summary" });

  app.get("/health", async () => ({ status: "ok" }));

  return app;
}

async function start() {
  const app = await buildApp();
  const port = Number(process.env.PORT) || 3001;
  const host = process.env.HOST ?? "0.0.0.0";

  try {
    await app.listen({ port, host });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();
