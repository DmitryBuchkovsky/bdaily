import type { InputJsonValue } from "@prisma/client/runtime/library";
import type { MentionRepository } from "../repositories/mention.repository.js";
import type { NotificationService } from "./notification/service.js";

export class MentionService {
  constructor(
    private readonly mentionRepo: MentionRepository,
    private readonly notificationService: NotificationService,
  ) {}

  extractMentionIds(html: string): string[] {
    const regex = /data-mention-id="([^"]+)"/g;
    const ids: Set<string> = new Set();
    let match: RegExpExecArray | null;
    while ((match = regex.exec(html)) !== null) {
      if (match[1]) ids.add(match[1]);
    }
    return Array.from(ids);
  }

  async processMentions(
    authorId: string,
    authorName: string,
    dailyReportId: string | null | undefined,
    fields: { name: string; html: string }[],
  ): Promise<void> {
    if (dailyReportId) {
      await this.mentionRepo.deleteByReport(dailyReportId);
    }

    const mentionData: {
      mentionedUserId: string;
      mentionedById: string;
      dailyReportId?: string;
      field: string;
    }[] = [];

    const notifiedUsers = new Set<string>();

    for (const { name, html } of fields) {
      const ids = this.extractMentionIds(html);
      for (const userId of ids) {
        if (userId === authorId) continue;
        mentionData.push({
          mentionedUserId: userId,
          mentionedById: authorId,
          ...(dailyReportId ? { dailyReportId } : {}),
          field: name,
        });

        if (!notifiedUsers.has(userId)) {
          notifiedUsers.add(userId);
          await this.notificationService.notify({
            userId,
            type: "MENTION",
            title: "You were mentioned",
            message: `${authorName} mentioned you in their daily report`,
            metadata: {
              dailyReportId: dailyReportId ?? null,
              mentionedById: authorId,
            } as unknown as InputJsonValue,
          });
        }
      }
    }

    await this.mentionRepo.createMany(mentionData);
  }
}
