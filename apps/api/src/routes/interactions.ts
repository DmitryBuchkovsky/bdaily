import type { FastifyInstance } from "fastify";
import { authenticate } from "../middleware/auth.js";
import type { UserRepository } from "../repositories/user.repository.js";
import type { ReportInteractionService } from "../services/report-interaction.service.js";

export function interactionRoutes(
  interactionService: ReportInteractionService,
  userRepo: UserRepository,
) {
  return async function (app: FastifyInstance): Promise<void> {
    app.addHook("preHandler", authenticate);

    // ── Reactions ──────────────────────────────────────────────────────

    app.get<{ Params: { reportId: string } }>("/:reportId/reactions", async (request) => {
      const reactions = await interactionService.getReactions(
        request.params.reportId,
        request.user.sub,
      );
      return { data: reactions };
    });

    app.post<{ Params: { reportId: string } }>("/:reportId/reactions", async (request) => {
      const { emoji } = request.body as { emoji: string };
      if (!emoji || typeof emoji !== "string" || emoji.length > 8) {
        return { error: "Invalid emoji" };
      }
      const user = await userRepo.findById(request.user.sub);
      const result = await interactionService.toggleReaction(
        request.params.reportId,
        request.user.sub,
        emoji,
        user?.name ?? "Someone",
      );
      return { data: result };
    });

    // ── Comments ──────────────────────────────────────────────────────

    app.get<{ Params: { reportId: string } }>("/:reportId/comments", async (request) => {
      const comments = await interactionService.getComments(request.params.reportId);
      return { data: comments };
    });

    app.post<{ Params: { reportId: string } }>("/:reportId/comments", async (request) => {
      const { content, parentId } = request.body as {
        content: string;
        parentId?: string;
      };
      if (!content || typeof content !== "string") {
        return { error: "Content is required" };
      }
      const user = await userRepo.findById(request.user.sub);
      const comment = await interactionService.addComment(
        request.params.reportId,
        request.user.sub,
        content,
        user?.name ?? "Someone",
        parentId,
      );
      return { data: comment };
    });

    app.put<{ Params: { commentId: string } }>("/comments/:commentId", async (request) => {
      const { content } = request.body as { content: string };
      const comment = await interactionService.updateComment(
        request.params.commentId,
        request.user.sub,
        content,
      );
      return { data: comment };
    });

    app.put<{ Params: { commentId: string } }>("/comments/:commentId/resolve", async (request) => {
      const { resolved } = request.body as { resolved: boolean };
      const comment = await interactionService.resolveComment(request.params.commentId, resolved);
      return { data: comment };
    });

    app.delete<{ Params: { commentId: string } }>(
      "/comments/:commentId",
      async (request, reply) => {
        await interactionService.deleteComment(request.params.commentId, request.user.sub);
        return reply.status(204).send();
      },
    );
  };
}
