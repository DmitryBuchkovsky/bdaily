import type { FastifyInstance } from "fastify";
import { createDailyReportSchema } from "@bdaily/shared";
import type { DailyReportService } from "../services/daily.service.js";
import { authenticate } from "../middleware/auth.js";
import {
  NotFoundError,
  ValidationError,
} from "../middleware/error-handler.js";

interface DailyParams {
  date?: string;
  id?: string;
}

interface DailyHistoryQuery {
  page?: string;
  limit?: string;
}

export function dailyRoutes(
  dailyService: DailyReportService,
): (app: FastifyInstance) => Promise<void> {
  return async (app: FastifyInstance): Promise<void> => {
    app.addHook("preHandler", authenticate);

    app.get<{ Querystring: DailyHistoryQuery }>(
      "/history",
      async (request, reply) => {
        const page = Number(request.query.page) || 1;
        const limit = Number(request.query.limit) || 20;
        const { reports, total } = await dailyService.getHistory(
          request.user.sub,
          page,
          limit,
        );
        return reply.send({
          data: reports,
          error: null,
          meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        });
      },
    );

    app.get<{ Params: DailyParams }>("/:date", async (request, reply) => {
      const { date } = request.params;
      if (!date) throw new ValidationError("date parameter is required");
      const report = await dailyService.getByDate(request.user.sub, date);
      if (!report) {
        throw new NotFoundError("Daily report not found for this date");
      }
      return reply.send({ data: report, error: null, meta: null });
    });

    app.post("/", async (request, reply) => {
      const input = createDailyReportSchema.parse(request.body);
      const report = await dailyService.create(request.user.sub, input);
      return reply.status(201).send({ data: report, error: null, meta: null });
    });

    app.put<{ Params: DailyParams }>("/:id", async (request, reply) => {
      const { id } = request.params;
      if (!id) throw new ValidationError("id parameter is required");
      const input = createDailyReportSchema.parse(request.body);
      const report = await dailyService.update(
        request.user.sub,
        id,
        input,
      );
      return reply.send({ data: report, error: null, meta: null });
    });
  };
}
