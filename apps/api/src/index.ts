import { createTransport } from "nodemailer";
import Fastify from "fastify";
import type { FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import fjwt from "@fastify/jwt";
import multipart from "@fastify/multipart";
import fstatic from "@fastify/static";
import { prisma } from "./lib/prisma.js";
import { errorHandler } from "./middleware/error-handler.js";
import { startCronJobs } from "./lib/cron.js";
import { getUploadDir, ensureUploadDir } from "./lib/uploads.js";

import { PrismaUserRepository } from "./repositories/user.repository.js";
import { PrismaDailyReportRepository } from "./repositories/daily.repository.js";
import { PrismaTeamRepository } from "./repositories/team.repository.js";
import {
  PrismaNotificationRepository,
  PrismaNotificationPreferenceRepository,
} from "./repositories/notification.repository.js";
import { PrismaActionItemRepository } from "./repositories/action-item.repository.js";
import { PrismaMentionRepository } from "./repositories/mention.repository.js";
import { PrismaReactionRepository } from "./repositories/reaction.repository.js";
import { PrismaCommentRepository } from "./repositories/comment.repository.js";
import { PrismaEmailTemplateRepository } from "./repositories/email-template.repository.js";
import { PrismaPasswordResetRepository } from "./repositories/password-reset.repository.js";

import { AuthService } from "./services/auth.service.js";
import { DailyReportService } from "./services/daily.service.js";
import { SummaryService } from "./services/summary.service.js";
import { TeamService } from "./services/team.service.js";
import { UserService } from "./services/user.service.js";
import { EmailService } from "./services/email.service.js";
import { NotificationService } from "./services/notification/service.js";
import { InAppChannel } from "./services/notification/in-app.channel.js";
import { EmailChannel } from "./services/notification/email.channel.js";
import { TelegramChannel } from "./services/notification/telegram.channel.js";
import { ActionItemService } from "./services/action-item.service.js";
import { MentionService } from "./services/mention.service.js";
import { ReportInteractionService } from "./services/report-interaction.service.js";

import { createTicketStrategy } from "./services/ticket-system/factory.js";

import { authRoutes } from "./routes/auth.js";
import { dailyRoutes } from "./routes/daily.js";
import { ticketRoutes } from "./routes/tickets.js";
import { summaryRoutes } from "./routes/summary.js";
import { adminRoutes } from "./routes/admin.js";
import { profileRoutes } from "./routes/profile.js";
import { boardRoutes } from "./routes/board.js";
import { actionItemRoutes } from "./routes/action-items.js";
import { notificationRoutes } from "./routes/notifications.js";
import { themeRoutes } from "./routes/theme.js";
import { interactionRoutes } from "./routes/interactions.js";

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

  await app.register(multipart, { limits: { fileSize: 2 * 1024 * 1024 } });

  await ensureUploadDir();
  await app.register(fstatic, {
    root: getUploadDir(),
    prefix: "/uploads/",
    decorateReply: false,
  });

  app.setErrorHandler(errorHandler);

  // Repositories
  const userRepo = new PrismaUserRepository(prisma);
  const dailyRepo = new PrismaDailyReportRepository(prisma);
  const teamRepo = new PrismaTeamRepository(prisma);
  const notifRepo = new PrismaNotificationRepository(prisma);
  const prefRepo = new PrismaNotificationPreferenceRepository(prisma);
  const actionItemRepo = new PrismaActionItemRepository(prisma);
  const mentionRepo = new PrismaMentionRepository(prisma);
  const reactionRepo = new PrismaReactionRepository(prisma);
  const commentRepo = new PrismaCommentRepository(prisma);
  const emailTemplateRepo = new PrismaEmailTemplateRepository(prisma);
  const passwordResetRepo = new PrismaPasswordResetRepository(prisma);

  // Mail transport
  const smtpHost = process.env.SMTP_HOST;
  const mailTransporter = smtpHost
    ? createTransport({
        host: smtpHost,
        port: Number(process.env.SMTP_PORT) || 587,
        ...(process.env.SMTP_USER
          ? { auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } }
          : {}),
      })
    : null;
  if (mailTransporter) {
    app.log.info(`Email transport configured → ${smtpHost}:${process.env.SMTP_PORT ?? 587}`);
  }

  const appUrl = process.env.APP_URL ?? "http://localhost:8090";
  const emailFrom = process.env.EMAIL_FROM ?? "noreply@bdaily.app";

  const emailService = new EmailService(mailTransporter, emailTemplateRepo, emailFrom, appUrl);

  // Notification channels (strategy pattern)
  const inAppChannel = new InAppChannel(notifRepo);
  const emailChannel = new EmailChannel(emailService, userRepo);
  const telegramChannel = new TelegramChannel(process.env.TELEGRAM_BOT_TOKEN, prefRepo);

  // Services
  const authService = new AuthService(userRepo, {
    sign(payload: { sub: string; role: string }, options: { expiresIn: string }): string {
      return app.jwt.sign(payload, options);
    },
    verify(token: string): { sub: string; role: string } {
      return app.jwt.verify<{ sub: string; role: string }>(token);
    },
  });
  const dailyService = new DailyReportService(dailyRepo);
  const summaryService = new SummaryService(userRepo, dailyRepo, createTicketStrategy);
  const teamService = new TeamService(teamRepo);
  const userService = new UserService(userRepo, emailService);
  const notificationService = new NotificationService(notifRepo, prefRepo, {
    inApp: inAppChannel,
    email: emailChannel,
    telegram: telegramChannel,
  });
  const actionItemService = new ActionItemService(actionItemRepo, notificationService);
  const interactionService = new ReportInteractionService(
    reactionRepo,
    commentRepo,
    dailyRepo,
    notificationService,
  );
  void new MentionService(mentionRepo, notificationService);

  // Routes
  await app.register(authRoutes(authService, userRepo, emailService, passwordResetRepo), {
    prefix: "/auth",
  });
  await app.register(dailyRoutes(dailyService), { prefix: "/daily" });
  await app.register(ticketRoutes(userRepo), { prefix: "/tickets" });
  await app.register(summaryRoutes(summaryService), { prefix: "/summary" });
  await app.register(adminRoutes(teamService, userService, emailTemplateRepo), {
    prefix: "/admin",
  });
  await app.register(profileRoutes(userService, prefRepo), { prefix: "/profile" });
  await app.register(boardRoutes(userRepo, dailyService, interactionService), { prefix: "/board" });
  await app.register(interactionRoutes(interactionService, userRepo), { prefix: "/reports" });
  await app.register(actionItemRoutes(actionItemService, userRepo), { prefix: "/action-items" });
  await app.register(notificationRoutes(notificationService), { prefix: "/notifications" });
  await app.register(themeRoutes(teamService, userRepo), { prefix: "/theme" });

  app.get(
    "/health",
    async (): Promise<{ status: string }> => ({
      status: "ok",
    }),
  );

  startCronJobs(actionItemService);

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
