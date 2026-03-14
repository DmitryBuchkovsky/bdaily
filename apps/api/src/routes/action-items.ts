import type { FastifyInstance } from "fastify";
import { createActionItemSchema, updateActionItemSchema } from "@bdaily/shared";
import { authenticate, requireAdmin } from "../middleware/auth.js";
import type { ActionItemService } from "../services/action-item.service.js";
import type { UserRepository } from "../repositories/user.repository.js";
import { NotFoundError } from "../middleware/error-handler.js";

function serialize(item: Record<string, unknown>): Record<string, unknown> {
  const result = { ...item };
  for (const key of ["dueDate", "completedAt", "lastRemindedAt", "createdAt", "updatedAt"]) {
    const val = result[key];
    if (val instanceof Date) {
      result[key] = val.toISOString();
    }
  }
  return result;
}

export function actionItemRoutes(actionItemService: ActionItemService, userRepo: UserRepository) {
  return async function (app: FastifyInstance): Promise<void> {
    app.addHook("preHandler", authenticate);

    app.get("/", async (request) => {
      const status = (request.query as Record<string, string>).status as
        | "PENDING"
        | "IN_PROGRESS"
        | "PENDING_APPROVAL"
        | "DONE"
        | "REJECTED"
        | "OVERDUE"
        | undefined;
      const items = await actionItemService.getForUser(request.user.sub, {
        status,
      });
      return { data: items.map((i) => serialize(i as unknown as Record<string, unknown>)) };
    });

    app.get("/team", { preHandler: [requireAdmin] }, async (request) => {
      const user = await userRepo.findById(request.user.sub);
      if (!user) throw new NotFoundError("User not found");
      const status = (request.query as Record<string, string>).status as
        | "PENDING"
        | "IN_PROGRESS"
        | "PENDING_APPROVAL"
        | "DONE"
        | "REJECTED"
        | "OVERDUE"
        | undefined;
      const items = await actionItemService.getForTeam(user.teamId, {
        status,
      });
      return { data: items.map((i) => serialize(i as unknown as Record<string, unknown>)) };
    });

    app.get("/pending-approval", { preHandler: [requireAdmin] }, async (request) => {
      const items = await actionItemService.getPendingApproval(request.user.sub);
      return { data: items.map((i) => serialize(i as unknown as Record<string, unknown>)) };
    });

    app.post("/", { preHandler: [requireAdmin] }, async (request, reply) => {
      const input = createActionItemSchema.parse(request.body);
      const user = await userRepo.findById(request.user.sub);
      if (!user) throw new NotFoundError("User not found");

      const item = await actionItemService.create({
        ...input,
        assignedById: request.user.sub,
        teamId: user.teamId,
      });
      return reply
        .status(201)
        .send({ data: serialize(item as unknown as Record<string, unknown>) });
    });

    app.put<{ Params: { id: string } }>("/:id", { preHandler: [requireAdmin] }, async (request) => {
      const input = updateActionItemSchema.parse(request.body);
      const item = await actionItemService.update(request.params.id, input);
      return { data: serialize(item as unknown as Record<string, unknown>) };
    });

    app.put<{ Params: { id: string } }>("/:id/request-done", async (request) => {
      const item = await actionItemService.requestDone(request.params.id, request.user.sub);
      return { data: serialize(item as unknown as Record<string, unknown>) };
    });

    app.put<{ Params: { id: string } }>("/:id/approve", async (request) => {
      const item = await actionItemService.approve(request.params.id, request.user.sub);
      return { data: serialize(item as unknown as Record<string, unknown>) };
    });

    app.put<{ Params: { id: string } }>("/:id/reject", async (request) => {
      const item = await actionItemService.reject(request.params.id, request.user.sub);
      return { data: serialize(item as unknown as Record<string, unknown>) };
    });

    app.delete<{ Params: { id: string } }>(
      "/:id",
      { preHandler: [requireAdmin] },
      async (request, reply) => {
        await actionItemService.delete(request.params.id);
        return reply.status(204).send();
      },
    );
  };
}
