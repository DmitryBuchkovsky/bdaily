import type {
  DailyReportRepository,
  DailyReportFull,
} from "../repositories/daily.repository.js";
import type { UserRepository } from "../repositories/user.repository.js";
import type {
  TicketSystemStrategy,
  TicketSystemConfig,
  SprintInfo,
  BurndownPoint,
} from "./ticket-system/strategy.js";
import {
  NotFoundError,
  ForbiddenError,
} from "../middleware/error-handler.js";

type TicketStrategyFactory = (type: string) => TicketSystemStrategy;

interface PersonSummaryResult {
  user: { id: string; name: string; email: string };
  period: { from?: Date; to?: Date };
  stats: {
    totalReports: number;
    totalCompleted: number;
    totalBugsFixed: number;
    totalTasksDone: number;
    totalBlockers: number;
    unresolvedBlockers: number;
    totalTested: number;
  };
  recentCompleted: DailyReportFull["completedItems"];
  activeBlockers: DailyReportFull["blockers"];
  upcomingWork: DailyReportFull["todayItems"];
}

interface SprintSummaryResult {
  sprint: SprintInfo | null;
  burndown: BurndownPoint[];
  team: { id: string; name: string; email: string }[];
  stats: {
    totalReports: number;
    totalCompleted: number;
    activeBlockers: number;
  };
  reportsByUser: Array<{
    user: { id: string; name: string; email: string };
    reports: DailyReportFull[];
  }>;
}

interface TeamSummaryResult {
  team: { id: string; memberCount: number };
  period: { from?: Date; to?: Date };
  stats: {
    totalReports: number;
    totalCompleted: number;
    totalBugsFixed: number;
    totalTasksDone: number;
    activeBlockers: number;
  };
  members: Array<{
    user: { id: string; name: string; email: string };
    reportCount: number;
    completedCount: number;
    blockerCount: number;
  }>;
}

export class SummaryService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly dailyRepo: DailyReportRepository,
    private readonly ticketStrategyFactory: TicketStrategyFactory,
  ) {}

  async getPersonSummary(
    userId: string,
    requesterId: string,
    from?: Date,
    to?: Date,
  ): Promise<PersonSummaryResult> {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundError("User not found");

    const requester = await this.userRepo.findById(requesterId);
    if (
      !requester ||
      (requester.teamId !== user.teamId && requester.role !== "ADMIN")
    ) {
      throw new ForbiddenError("You can only view summaries for your team");
    }

    const reports = await this.dailyRepo.findByUserInPeriod(
      userId,
      from ?? new Date(0),
      to ?? new Date(),
    );

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
        totalBugsFixed: completedItems.filter((i) => i.type === "BUG_FIX")
          .length,
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

  async getSprintSummary(
    sprintId: string,
    requesterId: string,
  ): Promise<SprintSummaryResult> {
    const requester = await this.userRepo.findByIdWithTeam(requesterId);
    if (!requester) throw new NotFoundError("User not found");

    const strategy = this.ticketStrategyFactory(
      requester.team.ticketSystemType,
    );

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

    const teamMembers = await this.userRepo.findByTeamId(requester.teamId);
    const memberInfos = teamMembers.map((m) => ({
      id: m.id,
      name: m.name,
      email: m.email,
    }));

    const reports = sprintInfo
      ? await this.dailyRepo.findByTeamInPeriod(
          requester.teamId,
          sprintInfo.startDate,
          sprintInfo.endDate,
        )
      : [];

    return {
      sprint: sprintInfo,
      burndown,
      team: memberInfos,
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
      reportsByUser: memberInfos.map((member) => ({
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
  ): Promise<TeamSummaryResult> {
    const requester = await this.userRepo.findById(requesterId);
    if (!requester) throw new NotFoundError("User not found");

    if (requester.teamId !== teamId && requester.role !== "ADMIN") {
      throw new ForbiddenError("You can only view summaries for your team");
    }

    const members = await this.userRepo.findByTeamId(teamId);
    const memberInfos = members.map((m) => ({
      id: m.id,
      name: m.name,
      email: m.email,
    }));

    const reports = await this.dailyRepo.findByTeamInPeriod(
      teamId,
      from ?? new Date(0),
      to ?? new Date(),
    );

    const allCompleted = reports.flatMap((r) => r.completedItems);
    const allBlockers = reports.flatMap((r) => r.blockers);

    return {
      team: { id: teamId, memberCount: members.length },
      period: { from, to },
      stats: {
        totalReports: reports.length,
        totalCompleted: allCompleted.length,
        totalBugsFixed: allCompleted.filter((i) => i.type === "BUG_FIX")
          .length,
        totalTasksDone: allCompleted.filter((i) => i.type === "TASK").length,
        activeBlockers: allBlockers.filter((b) => !b.resolvedAt).length,
      },
      members: memberInfos.map((member) => {
        const memberReports = reports.filter((r) => r.userId === member.id);
        return {
          user: member,
          reportCount: memberReports.length,
          completedCount: memberReports.reduce(
            (sum, r) => sum + r.completedItems.length,
            0,
          ),
          blockerCount: memberReports.reduce(
            (sum, r) =>
              sum + r.blockers.filter((b) => !b.resolvedAt).length,
            0,
          ),
        };
      }),
    };
  }
}
