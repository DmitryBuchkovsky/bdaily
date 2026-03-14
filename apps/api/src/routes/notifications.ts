import type { FastifyInstance } from "fastify";
import { authenticate } from "../middleware/auth.js";
import type { NotificationService } from "../services/notification/service.js";

export function notificationRoutes(notificationService: NotificationService) {
  return async function (app: FastifyInstance): Promise<void> {
    app.addHook("preHandler", authenticate);

    app.get("/", async (request) => {
      const q = request.query as Record<string, string>;
      const unreadOnly = q.unread === "true";
      const limit = Number(q.limit) || 20;
      const offset = Number(q.offset) || 0;

      const notifications = await notificationService.getForUser(request.user.sub, {
        unreadOnly,
        limit,
        offset,
      });
      return {
        data: notifications.map((n) => ({
          ...n,
          createdAt: n.createdAt.toISOString(),
          readAt: n.readAt?.toISOString() ?? null,
        })),
      };
    });

    app.get("/unread-count", async (request) => {
      const count = await notificationService.getUnreadCount(request.user.sub);
      return { data: { count } };
    });

    app.put<{ Params: { id: string } }>("/:id/read", async (request) => {
      const notification = await notificationService.markRead(request.params.id, request.user.sub);
      return {
        data: {
          ...notification,
          createdAt: notification.createdAt.toISOString(),
          readAt: notification.readAt?.toISOString() ?? null,
        },
      };
    });

    app.put("/read-all", async (request) => {
      await notificationService.markAllRead(request.user.sub);
      return { data: { success: true } };
    });
  };
}
