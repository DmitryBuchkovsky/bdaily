import { prisma } from "../lib/prisma.js";
import {
  NotFoundError,
  ForbiddenError,
} from "../middleware/error-handler.js";
import { createTicketStrategy } from "./ticket-system/factory.js";
import type { TicketSystemConfig } from "./ticket-system/strategy.js";

export class SummaryService {
  async getPersonSummary(
    userId: string,
    requesterId: string,
    from?: Date,
    to?: Date,
  ) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { team: true },
    });

    if (!user) throw new NotFoundError("User not found");

    const requester = await prisma.user.findUnique({
      where: { id: requesterId },
    });

    if (!requester || (requester.teamId !== user.teamId && requester.role !== "ADMIN")) {
      throw new ForbiddenError("You can only view summaries for your team");
    }

    const dateFilter = {
      ...(from ? { gte: from } : {}),
      ...(to ? { lte: to } : {}),
    };

    const reports = await prisma.dailyReport.findMany({
      where: {
        userId,
        ...(from || to ? { date: dateFilter } : {}),
      },
      include: {
        completedItems: true,
        todayItems: true,
        blockers: true,
        testedTickets: true,
      },
      orderBy: { date: "desc" },
    });

    const completedItems = reports.flatMap((r) => r.completedItems);
    const blockers = reports.flatMap((r) => r.blockers);
    const todayItems = reports.flatMap((r) => r.todayItems);
    const testedTickets = reports.flatMap((r) => r.testedTickets);

    return {
      user: { id: user.id, name: user.name, email: user.email },
      period: { from, to },
      stats: {
        totalReports: reports.length,
        totalCompleted: completedItems.length,
        totalBugsFixed: completedItems.filter((i) => i.type === "BUG_FIX").length,
        totalTasksDone: completedItems.filter((i) => i.type === "TASK").length,
        totalBlockers: blockers.length,
        unresolvedBlockers: blockers.filter((b) => !b.resolvedAt).length,
        totalTested: testedTickets.length,
      },
      recentCompleted: completedItems.slice(0, 10),
      activeBlockers: blockers.filter((b) => !b.resolvedAt),
      upcomingWork: todayItems.slice(0, 10),
    };
  }

  async getSprintSummary(sprintId: string, requesterId: string) {
    const requester = await prisma.user.findUnique({
      where: { id: requesterId },
      include: { team: true },
    });

    if (!requester) throw new NotFoundError("User not found");

    const strategy = createTicketStrategy(requester.team.ticketSystemType);

    if (requester.ticketSystemToken) {
      const config: TicketSystemConfig = {
        ...(requester.team.ticketSystemConfig as {
          baseUrl: string;
          projectIds?: string[];
        }),
        token: requester.ticketSystemToken,
      };
      await strategy.authenticate(config);
    }

    const [sprintInfo, burndown] = await Promise.all([
      strategy.getSprintInfo(sprintId),
      strategy.getBurndownData(sprintId),
    ]);

    const teamMembers = await prisma.user.findMany({
      where: { teamId: requester.teamId },
      select: { id: true, name: true, email: true },
    });

    const reports = sprintInfo
      ? await prisma.dailyReport.findMany({
          where: {
            userId: { in: teamMembers.map((m) => m.id) },
            date: { gte: sprintInfo.startDate, lte: sprintInfo.endDate },
          },
          include: {
            completedItems: true,
            blockers: true,
            user: { select: { id: true, name: true } },
          },
        })
      : [];

    return {
      sprint: sprintInfo,
      burndown,
      team: teamMembers,
      stats: {
        totalReports: reports.length,
        totalCompleted: reports.reduce(
          (sum, r) => sum + r.completedItems.length,
          0,
        ),
        activeBlockers: reports
          .flatMap((r) => r.blockers)
          .filter((b) => !b.resolvedAt).length,
      },
      reportsByUser: teamMembers.map((member) => ({
        user: member,
        reports: reports.filter((r) => r.userId === member.id),
      })),
    };
  }

  async getTeamSummary(
    teamId: string,
    requesterId: string,
    from?: Date,
    to?: Date,
  ) {
    const requester = await prisma.user.findUnique({
      where: { id: requesterId },
    });

    if (!requester) throw new NotFoundError("User not found");

    if (requester.teamId !== teamId && requester.role !== "ADMIN") {
      throw new ForbiddenError("You can only view summaries for your team");
    }

    const dateFilter = {
      ...(from ? { gte: from } : {}),
      ...(to ? { lte: to } : {}),
    };

    const members = await prisma.user.findMany({
      where: { teamId },
      select: { id: true, name: true, email: true },
    });

    const reports = await prisma.dailyReport.findMany({
      where: {
        userId: { in: members.map((m) => m.id) },
        ...(from || to ? { date: dateFilter } : {}),
      },
      include: {
        completedItems: true,
        blockers: true,
        todayItems: true,
        user: { select: { id: true, name: true } },
      },
      orderBy: { date: "desc" },
    });

    const allCompleted = reports.flatMap((r) => r.completedItems);
    const allBlockers = reports.flatMap((r) => r.blockers);

    return {
      team: { id: teamId, memberCount: members.length },
      period: { from, to },
      stats: {
        totalReports: reports.length,
        totalCompleted: allCompleted.length,
        totalBugsFixed: allCompleted.filter((i) => i.type === "BUG_FIX").length,
        totalTasksDone: allCompleted.filter((i) => i.type === "TASK").length,
        activeBlockers: allBlockers.filter((b) => !b.resolvedAt).length,
      },
      members: members.map((member) => {
        const memberReports = reports.filter((r) => r.userId === member.id);
        return {
          user: member,
          reportCount: memberReports.length,
          completedCount: memberReports.reduce(
            (sum, r) => sum + r.completedItems.length,
            0,
          ),
          blockerCount: memberReports.reduce(
            (sum, r) => sum + r.blockers.filter((b) => !b.resolvedAt).length,
            0,
          ),
        };
      }),
    };
  }
}
