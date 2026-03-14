import type { PrismaClient, ReportComment } from "@prisma/client";

export interface CommentWithUser extends ReportComment {
  user: { id: string; name: string; avatarUrl: string | null };
  replies?: CommentWithUser[];
}

export interface CommentRepository {
  findByReport(reportId: string): Promise<CommentWithUser[]>;
  findById(id: string): Promise<CommentWithUser | null>;
  create(data: {
    dailyReportId: string;
    userId: string;
    content: string;
    parentId?: string;
  }): Promise<CommentWithUser>;
  update(id: string, content: string): Promise<CommentWithUser>;
  resolve(id: string, resolved: boolean): Promise<CommentWithUser>;
  delete(id: string): Promise<void>;
  countByReport(reportId: string): Promise<number>;
}

const commentInclude = {
  user: { select: { id: true, name: true, avatarUrl: true } },
  replies: {
    include: {
      user: { select: { id: true, name: true, avatarUrl: true } },
    },
    orderBy: { createdAt: "asc" as const },
  },
} as const;

export class PrismaCommentRepository implements CommentRepository {
  constructor(private readonly db: PrismaClient) {}

  async findByReport(reportId: string): Promise<CommentWithUser[]> {
    return this.db.reportComment.findMany({
      where: { dailyReportId: reportId, parentId: null },
      include: commentInclude,
      orderBy: { createdAt: "asc" },
    }) as Promise<CommentWithUser[]>;
  }

  async findById(id: string): Promise<CommentWithUser | null> {
    return this.db.reportComment.findUnique({
      where: { id },
      include: commentInclude,
    }) as Promise<CommentWithUser | null>;
  }

  async create(data: {
    dailyReportId: string;
    userId: string;
    content: string;
    parentId?: string;
  }): Promise<CommentWithUser> {
    return this.db.reportComment.create({
      data,
      include: commentInclude,
    }) as Promise<CommentWithUser>;
  }

  async update(id: string, content: string): Promise<CommentWithUser> {
    return this.db.reportComment.update({
      where: { id },
      data: { content },
      include: commentInclude,
    }) as Promise<CommentWithUser>;
  }

  async resolve(id: string, resolved: boolean): Promise<CommentWithUser> {
    return this.db.reportComment.update({
      where: { id },
      data: { resolved },
      include: commentInclude,
    }) as Promise<CommentWithUser>;
  }

  async delete(id: string): Promise<void> {
    await this.db.reportComment.delete({ where: { id } });
  }

  async countByReport(reportId: string): Promise<number> {
    return this.db.reportComment.count({
      where: { dailyReportId: reportId },
    });
  }
}
