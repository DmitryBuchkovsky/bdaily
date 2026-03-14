import type { PrismaClient, ReportReaction } from "@prisma/client";

export interface ReactionWithUser extends ReportReaction {
  user: { id: string; name: string; avatarUrl: string | null };
}

export interface ReactionGroup {
  emoji: string;
  count: number;
  users: { id: string; name: string }[];
  currentUserReacted: boolean;
}

export interface ReactionRepository {
  findByReport(reportId: string): Promise<ReactionWithUser[]>;
  toggle(reportId: string, userId: string, emoji: string): Promise<{ added: boolean }>;
  countByReport(reportId: string): Promise<number>;
}

export class PrismaReactionRepository implements ReactionRepository {
  constructor(private readonly db: PrismaClient) {}

  async findByReport(reportId: string): Promise<ReactionWithUser[]> {
    return this.db.reportReaction.findMany({
      where: { dailyReportId: reportId },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } },
      },
      orderBy: { createdAt: "asc" },
    });
  }

  async toggle(reportId: string, userId: string, emoji: string): Promise<{ added: boolean }> {
    const existing = await this.db.reportReaction.findUnique({
      where: {
        dailyReportId_userId_emoji: {
          dailyReportId: reportId,
          userId,
          emoji,
        },
      },
    });

    if (existing) {
      await this.db.reportReaction.delete({ where: { id: existing.id } });
      return { added: false };
    }

    await this.db.reportReaction.create({
      data: { dailyReportId: reportId, userId, emoji },
    });
    return { added: true };
  }

  async countByReport(reportId: string): Promise<number> {
    return this.db.reportReaction.count({
      where: { dailyReportId: reportId },
    });
  }
}
