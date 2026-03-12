import type { CreateDailyReportInput } from "@bdaily/shared";
import type {
  DailyReportRepository,
  DailyReportFull,
} from "../repositories/daily.repository.js";
import {
  NotFoundError,
  ValidationError,
} from "../middleware/error-handler.js";

interface PaginatedReports {
  reports: DailyReportFull[];
  total: number;
}

export class DailyReportService {
  constructor(private readonly dailyRepo: DailyReportRepository) {}

  async getByDate(
    userId: string,
    dateStr: string,
  ): Promise<DailyReportFull | null> {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      throw new ValidationError("Invalid date format. Use YYYY-MM-DD");
    }
    return this.dailyRepo.findByUserAndDate(userId, date);
  }

  async getHistory(
    userId: string,
    page: number,
    limit: number,
  ): Promise<PaginatedReports> {
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(100, Math.max(1, limit));
    const skip = (safePage - 1) * safeLimit;

    const [reports, total] = await Promise.all([
      this.dailyRepo.findByUser(userId, skip, safeLimit),
      this.dailyRepo.countByUser(userId),
    ]);

    return { reports, total };
  }

  async create(
    userId: string,
    input: CreateDailyReportInput,
  ): Promise<DailyReportFull> {
    return this.dailyRepo.create(userId, input);
  }

  async update(
    userId: string,
    reportId: string,
    input: CreateDailyReportInput,
  ): Promise<DailyReportFull> {
    const existing = await this.dailyRepo.findById(reportId);
    if (!existing || existing.userId !== userId) {
      throw new NotFoundError("Daily report not found");
    }
    return this.dailyRepo.update(reportId, input);
  }
}
