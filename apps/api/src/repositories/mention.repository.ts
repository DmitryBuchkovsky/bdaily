import type { PrismaClient, Mention } from "@prisma/client";

interface CreateMentionData {
  mentionedUserId: string;
  mentionedById: string;
  dailyReportId?: string;
  field: string;
}

export interface MentionRepository {
  create(data: CreateMentionData): Promise<Mention>;
  createMany(data: CreateMentionData[]): Promise<void>;
  findByReport(dailyReportId: string): Promise<Mention[]>;
  deleteByReport(dailyReportId: string): Promise<void>;
}

export class PrismaMentionRepository implements MentionRepository {
  constructor(private readonly db: PrismaClient) {}

  async create(data: CreateMentionData): Promise<Mention> {
    return this.db.mention.create({ data });
  }

  async createMany(data: CreateMentionData[]): Promise<void> {
    if (data.length === 0) return;
    await this.db.mention.createMany({ data });
  }

  async findByReport(dailyReportId: string): Promise<Mention[]> {
    return this.db.mention.findMany({ where: { dailyReportId } });
  }

  async deleteByReport(dailyReportId: string): Promise<void> {
    await this.db.mention.deleteMany({ where: { dailyReportId } });
  }
}
