import type { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma.js";
import { authenticate } from "../middleware/auth.js";
import { NotFoundError, ValidationError } from "../middleware/error-handler.js";

interface DailyParams {
  date?: string;
  id?: string;
}

interface DailyHistoryQuery {
  page?: string;
  limit?: string;
}

const DAILY_REPORT_INCLUDE = {
  completedItems: true,
  todayItems: true,
  blockers: true,
  additionalNotes: true,
  questions: true,
  testedTickets: true,
} as const;

export async function dailyRoutes(app: FastifyInstance) {
  app.addHook("preHandler", authenticate);

  app.get<{ Params: DailyParams }>("/:date", async (request, reply) => {
    const { date } = request.params;
    if (!date) throw new ValidationError("date parameter is required");

    const parsed = new Date(date);
    if (isNaN(parsed.getTime())) {
      throw new ValidationError("Invalid date format. Use YYYY-MM-DD");
    }

    const report = await prisma.dailyReport.findUnique({
      where: {
        userId_date: { userId: request.user.sub, date: parsed },
      },
      include: DAILY_REPORT_INCLUDE,
    });

    if (!report) {
      throw new NotFoundError("Daily report not found for this date");
    }

    return reply.send({ data: report, error: null, meta: null });
  });

  app.post("/", async (request, reply) => {
    const body = request.body as {
      date: string;
      completedItems?: unknown[];
      todayItems?: unknown[];
      blockers?: unknown[];
      additionalNotes?: unknown;
      questions?: unknown[];
      testedTickets?: unknown[];
    };

    if (!body.date) {
      throw new ValidationError("date is required");
    }

    const date = new Date(body.date);
    if (isNaN(date.getTime())) {
      throw new ValidationError("Invalid date format. Use YYYY-MM-DD");
    }

    const report = await prisma.dailyReport.create({
      data: {
        userId: request.user.sub,
        date,
        completedItems: body.completedItems
          ? { createMany: { data: body.completedItems as [] } }
          : undefined,
        todayItems: body.todayItems
          ? { createMany: { data: body.todayItems as [] } }
          : undefined,
        blockers: body.blockers
          ? { createMany: { data: body.blockers as [] } }
          : undefined,
        additionalNotes: body.additionalNotes
          ? { create: body.additionalNotes as object }
          : undefined,
        questions: body.questions
          ? { createMany: { data: body.questions as [] } }
          : undefined,
        testedTickets: body.testedTickets
          ? { createMany: { data: body.testedTickets as [] } }
          : undefined,
      },
      include: DAILY_REPORT_INCLUDE,
    });

    return reply.status(201).send({ data: report, error: null, meta: null });
  });

  app.put<{ Params: DailyParams }>("/:id", async (request, reply) => {
    const { id } = request.params;
    if (!id) throw new ValidationError("id parameter is required");

    const existing = await prisma.dailyReport.findFirst({
      where: { id, userId: request.user.sub },
    });

    if (!existing) {
      throw new NotFoundError("Daily report not found");
    }

    const body = request.body as Record<string, unknown>;

    const report = await prisma.dailyReport.update({
      where: { id },
      data: {
        ...(body.completedItems
          ? {
              completedItems: {
                deleteMany: {},
                createMany: { data: body.completedItems as [] },
              },
            }
          : {}),
        ...(body.todayItems
          ? {
              todayItems: {
                deleteMany: {},
                createMany: { data: body.todayItems as [] },
              },
            }
          : {}),
        ...(body.blockers
          ? {
              blockers: {
                deleteMany: {},
                createMany: { data: body.blockers as [] },
              },
            }
          : {}),
        ...(body.additionalNotes
          ? {
              additionalNotes: {
                upsert: {
                  create: body.additionalNotes as object,
                  update: body.additionalNotes as object,
                },
              },
            }
          : {}),
        ...(body.questions
          ? {
              questions: {
                deleteMany: {},
                createMany: { data: body.questions as [] },
              },
            }
          : {}),
        ...(body.testedTickets
          ? {
              testedTickets: {
                deleteMany: {},
                createMany: { data: body.testedTickets as [] },
              },
            }
          : {}),
      },
      include: DAILY_REPORT_INCLUDE,
    });

    return reply.send({ data: report, error: null, meta: null });
  });

  app.get<{ Querystring: DailyHistoryQuery }>(
    "/history",
    async (request, reply) => {
      const page = Math.max(1, Number(request.query.page) || 1);
      const limit = Math.min(100, Math.max(1, Number(request.query.limit) || 20));
      const skip = (page - 1) * limit;

      const [reports, total] = await Promise.all([
        prisma.dailyReport.findMany({
          where: { userId: request.user.sub },
          orderBy: { date: "desc" },
          skip,
          take: limit,
          include: DAILY_REPORT_INCLUDE,
        }),
        prisma.dailyReport.count({
          where: { userId: request.user.sub },
        }),
      ]);

      return reply.send({
        data: reports,
        error: null,
        meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
      });
    },
  );
}
