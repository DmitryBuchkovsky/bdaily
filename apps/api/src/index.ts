import Fastify from "fastify";
import type { FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import fjwt from "@fastify/jwt";
import { prisma } from "./lib/prisma.js";
import { errorHandler } from "./middleware/error-handler.js";
import { PrismaUserRepository } from "./repositories/user.repository.js";
import { PrismaDailyReportRepository } from "./repositories/daily.repository.js";
import { AuthService } from "./services/auth.service.js";
import { DailyReportService } from "./services/daily.service.js";
import { SummaryService } from "./services/summary.service.js";
import { createTicketStrategy } from "./services/ticket-system/factory.js";
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

async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: envToLogger[nodeEnv] ?? true,
  });

  await app.register(cors, {
    origin: process.env.CORS_ORIGIN ?? "http://localhost:8090",
    credentials: true,
  });

  await app.register(fjwt, {
    secret: process.env.JWT_SECRET ?? "change-me-in-production",
  });

  app.setErrorHandler(errorHandler);

  const userRepo = new PrismaUserRepository(prisma);
  const dailyRepo = new PrismaDailyReportRepository(prisma);

  const authService = new AuthService(userRepo, {
    sign(payload: { sub: string; role: string }, options: { expiresIn: string }): string {
      return app.jwt.sign(payload, options);
    },
    verify(token: string): { sub: string; role: string } {
      return app.jwt.verify<{ sub: string; role: string }>(token);
    },
  });
  const dailyService = new DailyReportService(dailyRepo);
  const summaryService = new SummaryService(
    userRepo,
    dailyRepo,
    createTicketStrategy,
  );

  await app.register(authRoutes(authService), { prefix: "/auth" });
  await app.register(dailyRoutes(dailyService), { prefix: "/daily" });
  await app.register(ticketRoutes(userRepo), { prefix: "/tickets" });
  await app.register(summaryRoutes(summaryService), { prefix: "/summary" });

  app.get("/health", async (): Promise<{ status: string }> => ({
    status: "ok",
  }));

  return app;
}

async function start(): Promise<void> {
  const app = await buildApp();
  const port = Number(process.env.PORT) || 8091;
  const host = process.env.HOST ?? "0.0.0.0";

  try {
    await app.listen({ port, host });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();
