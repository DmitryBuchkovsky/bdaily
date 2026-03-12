import type { PrismaClient, Prisma } from "@prisma/client";
import type { CreateDailyReportInput } from "@bdaily/shared";

const dailyReportInclude = {
  completedItems: true,
  todayItems: true,
  blockers: true,
  additionalNotes: true,
  questions: true,
  testedTickets: true,
} satisfies Prisma.DailyReportInclude;

export type DailyReportFull = Prisma.DailyReportGetPayload<{
  include: typeof dailyReportInclude;
}>;

export interface DailyReportRepository {
  findById(id: string): Promise<DailyReportFull | null>;
  findByUserAndDate(userId: string, date: Date): Promise<DailyReportFull | null>;
  findByUser(userId: string, skip: number, take: number): Promise<DailyReportFull[]>;
  countByUser(userId: string): Promise<number>;
  findByUserInPeriod(userId: string, from: Date, to: Date): Promise<DailyReportFull[]>;
  findByTeamInPeriod(teamId: string, from: Date, to: Date): Promise<DailyReportFull[]>;
  create(userId: string, data: CreateDailyReportInput): Promise<DailyReportFull>;
  update(id: string, data: CreateDailyReportInput): Promise<DailyReportFull>;
}

type TodayItemCreate = Prisma.TodayItemCreateWithoutDailyReportInput;

function mapTodayItemInput(
  item: CreateDailyReportInput["todayItems"][number],
): TodayItemCreate {
  return {
    priority: item.priority,
    title: item.title,
    ticketId: item.ticketId,
    goal: item.goal,
    approach: item.approach,
    etaToDev: item.etaToDev ? new Date(item.etaToDev) : undefined,
  };
}

export class PrismaDailyReportRepository implements DailyReportRepository {
  constructor(private readonly db: PrismaClient) {}

  async findById(id: string): Promise<DailyReportFull | null> {
    return this.db.dailyReport.findUnique({
      where: { id },
      include: dailyReportInclude,
    });
  }

  async findByUserAndDate(
    userId: string,
    date: Date,
  ): Promise<DailyReportFull | null> {
    return this.db.dailyReport.findUnique({
      where: { userId_date: { userId, date } },
      include: dailyReportInclude,
    });
  }

  async findByUser(
    userId: string,
    skip: number,
    take: number,
  ): Promise<DailyReportFull[]> {
    return this.db.dailyReport.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      skip,
      take,
      include: dailyReportInclude,
    });
  }

  async countByUser(userId: string): Promise<number> {
    return this.db.dailyReport.count({ where: { userId } });
  }

  async findByUserInPeriod(
    userId: string,
    from: Date,
    to: Date,
  ): Promise<DailyReportFull[]> {
    return this.db.dailyReport.findMany({
      where: { userId, date: { gte: from, lte: to } },
      include: dailyReportInclude,
      orderBy: { date: "desc" },
    });
  }

  async findByTeamInPeriod(
    teamId: string,
    from: Date,
    to: Date,
  ): Promise<DailyReportFull[]> {
    return this.db.dailyReport.findMany({
      where: { user: { teamId }, date: { gte: from, lte: to } },
      include: dailyReportInclude,
      orderBy: { date: "desc" },
    });
  }

  async create(
    userId: string,
    data: CreateDailyReportInput,
  ): Promise<DailyReportFull> {
    return this.db.dailyReport.create({
      data: {
        userId,
        date: new Date(data.date),
        completedItems: { create: data.completedItems },
        todayItems: { create: data.todayItems.map(mapTodayItemInput) },
        blockers: { create: data.blockers },
        additionalNotes: data.notes ? { create: data.notes } : undefined,
        questions: { create: data.questions },
        testedTickets: { create: data.testedTickets },
      },
      include: dailyReportInclude,
    });
  }

  async update(
    id: string,
    data: CreateDailyReportInput,
  ): Promise<DailyReportFull> {
    return this.db.$transaction(async (tx) => {
      await Promise.all([
        tx.completedItem.deleteMany({ where: { dailyReportId: id } }),
        tx.todayItem.deleteMany({ where: { dailyReportId: id } }),
        tx.blocker.deleteMany({ where: { dailyReportId: id } }),
        tx.additionalNotes.deleteMany({ where: { dailyReportId: id } }),
        tx.question.deleteMany({ where: { dailyReportId: id } }),
        tx.testedTicket.deleteMany({ where: { dailyReportId: id } }),
      ]);

      return tx.dailyReport.update({
        where: { id },
        data: {
          completedItems: { create: data.completedItems },
          todayItems: { create: data.todayItems.map(mapTodayItemInput) },
          blockers: { create: data.blockers },
          additionalNotes: data.notes ? { create: data.notes } : undefined,
          questions: { create: data.questions },
          testedTickets: { create: data.testedTickets },
        },
        include: dailyReportInclude,
      });
    });
  }
}
