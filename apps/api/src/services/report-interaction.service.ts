import type { InputJsonValue } from "@prisma/client/runtime/library";
import type { ReactionRepository, ReactionGroup } from "../repositories/reaction.repository.js";
import type { CommentRepository, CommentWithUser } from "../repositories/comment.repository.js";
import type { DailyReportRepository } from "../repositories/daily.repository.js";
import type { NotificationService } from "./notification/service.js";
import { ForbiddenError, NotFoundError } from "../middleware/error-handler.js";
import { sanitizeHtml } from "../lib/sanitize.js";

function meta(obj: Record<string, string | undefined>): InputJsonValue {
  return obj as unknown as InputJsonValue;
}

export class ReportInteractionService {
  constructor(
    private readonly reactionRepo: ReactionRepository,
    private readonly commentRepo: CommentRepository,
    private readonly dailyRepo: DailyReportRepository,
    private readonly notificationService: NotificationService,
  ) {}

  async getReactions(reportId: string, currentUserId: string): Promise<ReactionGroup[]> {
    const reactions = await this.reactionRepo.findByReport(reportId);
    const groups = new Map<string, ReactionGroup>();

    for (const r of reactions) {
      const existing = groups.get(r.emoji);
      if (existing) {
        existing.count++;
        existing.users.push({ id: r.user.id, name: r.user.name });
        if (r.userId === currentUserId) existing.currentUserReacted = true;
      } else {
        groups.set(r.emoji, {
          emoji: r.emoji,
          count: 1,
          users: [{ id: r.user.id, name: r.user.name }],
          currentUserReacted: r.userId === currentUserId,
        });
      }
    }

    return Array.from(groups.values());
  }

  async toggleReaction(
    reportId: string,
    userId: string,
    emoji: string,
    userName: string,
  ): Promise<{ added: boolean; reactions: ReactionGroup[] }> {
    const report = await this.dailyRepo.findById(reportId);
    if (!report) throw new NotFoundError("Report not found");

    const result = await this.reactionRepo.toggle(reportId, userId, emoji);

    if (result.added && report.userId !== userId) {
      await this.notificationService.notify({
        userId: report.userId,
        type: "REPORT_COMMENT",
        title: "New reaction on your report",
        message: `${userName} reacted ${emoji} to your daily report`,
        metadata: meta({ dailyReportId: reportId, reactedBy: userId }),
      });
    }

    const reactions = await this.getReactions(reportId, userId);
    return { added: result.added, reactions };
  }

  async getComments(reportId: string): Promise<CommentWithUser[]> {
    return this.commentRepo.findByReport(reportId);
  }

  async addComment(
    reportId: string,
    userId: string,
    content: string,
    userName: string,
    parentId?: string,
  ): Promise<CommentWithUser> {
    const report = await this.dailyRepo.findById(reportId);
    if (!report) throw new NotFoundError("Report not found");

    const sanitized = sanitizeHtml(content);
    const comment = await this.commentRepo.create({
      dailyReportId: reportId,
      userId,
      content: sanitized,
      parentId,
    });

    if (report.userId !== userId) {
      await this.notificationService.notify({
        userId: report.userId,
        type: "REPORT_COMMENT",
        title: "New comment on your report",
        message: `${userName} commented on your daily report`,
        metadata: meta({
          dailyReportId: reportId,
          commentId: comment.id,
          commentedBy: userId,
        }),
      });
    }

    if (parentId) {
      const parent = await this.commentRepo.findById(parentId);
      if (parent && parent.userId !== userId) {
        await this.notificationService.notify({
          userId: parent.userId,
          type: "REPORT_COMMENT",
          title: "Reply to your comment",
          message: `${userName} replied to your comment`,
          metadata: meta({
            dailyReportId: reportId,
            commentId: comment.id,
            parentCommentId: parentId,
            repliedBy: userId,
          }),
        });
      }
    }

    return comment;
  }

  async updateComment(
    commentId: string,
    userId: string,
    content: string,
  ): Promise<CommentWithUser> {
    const comment = await this.commentRepo.findById(commentId);
    if (!comment) throw new NotFoundError("Comment not found");
    if (comment.userId !== userId) {
      throw new ForbiddenError("You can only edit your own comments");
    }
    return this.commentRepo.update(commentId, sanitizeHtml(content));
  }

  async resolveComment(commentId: string, resolved: boolean): Promise<CommentWithUser> {
    const comment = await this.commentRepo.findById(commentId);
    if (!comment) throw new NotFoundError("Comment not found");
    return this.commentRepo.resolve(commentId, resolved);
  }

  async deleteComment(commentId: string, userId: string): Promise<void> {
    const comment = await this.commentRepo.findById(commentId);
    if (!comment) throw new NotFoundError("Comment not found");
    if (comment.userId !== userId) {
      throw new ForbiddenError("You can only delete your own comments");
    }
    await this.commentRepo.delete(commentId);
  }

  async getReactionCount(reportId: string): Promise<number> {
    return this.reactionRepo.countByReport(reportId);
  }

  async getCommentCount(reportId: string): Promise<number> {
    return this.commentRepo.countByReport(reportId);
  }
}
