import type { FastifyInstance } from "fastify";
import { authenticate } from "../middleware/auth.js";
import { ValidationError } from "../middleware/error-handler.js";
import { SummaryService } from "../services/summary.service.js";

interface PersonParams {
  userId?: string;
}

interface SprintParams {
  sprintId?: string;
}

interface TeamParams {
  teamId?: string;
}

interface SummaryQuery {
  from?: string;
  to?: string;
}

export async function summaryRoutes(app: FastifyInstance) {
  app.addHook("preHandler", authenticate);

  const summaryService = new SummaryService();

  app.get<{ Params: PersonParams; Querystring: SummaryQuery }>(
    "/person/:userId",
    async (request, reply) => {
      const { userId } = request.params;
      if (!userId) throw new ValidationError("userId is required");

      const from = request.query.from
        ? new Date(request.query.from)
        : undefined;
      const to = request.query.to ? new Date(request.query.to) : undefined;

      const summary = await summaryService.getPersonSummary(
        userId,
        request.user.sub,
        from,
        to,
      );

      return reply.send({ data: summary, error: null, meta: null });
    },
  );

  app.get<{ Params: SprintParams }>(
    "/sprint/:sprintId",
    async (request, reply) => {
      const { sprintId } = request.params;
      if (!sprintId) throw new ValidationError("sprintId is required");

      const summary = await summaryService.getSprintSummary(
        sprintId,
        request.user.sub,
      );

      return reply.send({ data: summary, error: null, meta: null });
    },
  );

  app.get<{ Params: TeamParams; Querystring: SummaryQuery }>(
    "/team/:teamId",
    async (request, reply) => {
      const { teamId } = request.params;
      if (!teamId) throw new ValidationError("teamId is required");

      const from = request.query.from
        ? new Date(request.query.from)
        : undefined;
      const to = request.query.to ? new Date(request.query.to) : undefined;

      const summary = await summaryService.getTeamSummary(
        teamId,
        request.user.sub,
        from,
        to,
      );

      return reply.send({ data: summary, error: null, meta: null });
    },
  );
}
