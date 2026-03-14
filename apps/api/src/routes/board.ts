import type { FastifyInstance } from "fastify";
import { authenticate } from "../middleware/auth.js";
import type { UserRepository } from "../repositories/user.repository.js";
import type { DailyReportService } from "../services/daily.service.js";
import type { ReportInteractionService } from "../services/report-interaction.service.js";
import { ForbiddenError, NotFoundError } from "../middleware/error-handler.js";

export function boardRoutes(
  userRepo: UserRepository,
  dailyService: DailyReportService,
  interactionService?: ReportInteractionService,
) {
  return async function (app: FastifyInstance): Promise<void> {
    app.addHook("preHandler", authenticate);

    app.get("/", async (request) => {
      const requester = await userRepo.findById(request.user.sub);
      if (!requester) throw new NotFoundError("User not found");

      const members = await userRepo.findByTeamId(requester.teamId);
      const dateStr = (() => {
        const q = request.query as Record<string, string> | null;
        return q?.date || new Date().toISOString().split("T")[0];
      })();

      const memberReports = await Promise.all(
        members.map(async (member) => {
          const report = await dailyService.getByDate(member.id, dateStr as string);
          let reactionCount = 0;
          let commentCount = 0;
          if (report && interactionService) {
            [reactionCount, commentCount] = await Promise.all([
              interactionService.getReactionCount(report.id),
              interactionService.getCommentCount(report.id),
            ]);
          }
          return {
            user: {
              id: member.id,
              name: member.name,
              email: member.email,
              role: member.role,
              avatarUrl: member.avatarUrl,
            },
            hasReport: !!report,
            report: report
              ? {
                  id: report.id,
                  date: report.date.toISOString().split("T")[0],
                  completedCount: report.completedItems.length,
                  todayCount: report.todayItems.length,
                  blockerCount: report.blockers.length,
                  questionCount: report.questions.length,
                  reactionCount,
                  commentCount,
                }
              : null,
          };
        }),
      );

      return { data: memberReports, meta: { date: dateStr } };
    });

    app.get("/full", async (request) => {
      const requester = await userRepo.findById(request.user.sub);
      if (!requester) throw new NotFoundError("User not found");

      const members = await userRepo.findByTeamId(requester.teamId);
      const dateStr = (() => {
        const q = request.query as Record<string, string> | null;
        return q?.date || new Date().toISOString().split("T")[0];
      })();

      const memberReports = await Promise.all(
        members.map(async (member) => {
          const report = await dailyService.getByDate(member.id, dateStr as string);
          return {
            user: {
              id: member.id,
              name: member.name,
              email: member.email,
              role: member.role,
              avatarUrl: member.avatarUrl,
            },
            hasReport: !!report,
            report: report ? serializeReport(report) : null,
          };
        }),
      );

      return { data: memberReports, meta: { date: dateStr } };
    });

    app.get<{ Params: { userId: string }; Querystring: { page?: string; limit?: string } }>(
      "/:userId",
      async (request) => {
        await assertSameTeam(request.user.sub, request.params.userId, userRepo);
        const page = Number(request.query.page) || 1;
        const limit = Number(request.query.limit) || 10;
        const result = await dailyService.getHistory(request.params.userId, page, limit);
        const target = await userRepo.findById(request.params.userId);
        return {
          data: {
            user: target ? { id: target.id, name: target.name, avatarUrl: target.avatarUrl } : null,
            reports: result.reports.map(serializeReport),
            total: result.total,
          },
        };
      },
    );

    app.get<{ Params: { userId: string; date: string } }>("/:userId/:date", async (request) => {
      await assertSameTeam(request.user.sub, request.params.userId, userRepo);
      const report = await dailyService.getByDate(request.params.userId, request.params.date);
      if (!report) throw new NotFoundError("Report not found for this date");
      const target = await userRepo.findById(request.params.userId);
      return {
        data: {
          user: target ? { id: target.id, name: target.name, avatarUrl: target.avatarUrl } : null,
          report: serializeReport(report),
        },
      };
    });
  };
}

async function assertSameTeam(
  requesterId: string,
  targetId: string,
  userRepo: UserRepository,
): Promise<void> {
  const [requester, target] = await Promise.all([
    userRepo.findById(requesterId),
    userRepo.findById(targetId),
  ]);
  if (!requester || !target) throw new NotFoundError("User not found");
  if (requester.role !== "ADMIN" && requester.teamId !== target.teamId) {
    throw new ForbiddenError("You can only view reports from your team");
  }
}

function serializeReport(report: {
  id: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
  completedItems: unknown[];
  todayItems: unknown[];
  blockers: unknown[];
  additionalNotes: unknown;
  questions: unknown[];
  testedTickets: unknown[];
}): Record<string, unknown> {
  return {
    id: report.id,
    date: report.date.toISOString().split("T")[0],
    createdAt: report.createdAt.toISOString(),
    updatedAt: report.updatedAt.toISOString(),
    completedItems: report.completedItems,
    todayItems: report.todayItems,
    blockers: report.blockers,
    notes: report.additionalNotes,
    questions: report.questions,
    testedTickets: report.testedTickets,
  };
}
