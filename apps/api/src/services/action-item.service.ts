import type { InputJsonValue } from "@prisma/client/runtime/library";
import type {
  ActionItemRepository,
  ActionItemWithUsers,
} from "../repositories/action-item.repository.js";
import type { NotificationService } from "./notification/service.js";
import { NotFoundError, ForbiddenError, ValidationError } from "../middleware/error-handler.js";

function meta(obj: Record<string, string | undefined>): InputJsonValue {
  return obj as unknown as InputJsonValue;
}

interface CreateInput {
  assignedById: string;
  assigneeId: string;
  teamId: string;
  title: string;
  description?: string;
  dueDate: string;
  dailyReportId?: string;
}

interface UpdateInput {
  title?: string;
  description?: string;
  dueDate?: string;
}

interface FindFilters {
  status?: "PENDING" | "IN_PROGRESS" | "PENDING_APPROVAL" | "DONE" | "REJECTED" | "OVERDUE";
}

export class ActionItemService {
  constructor(
    private readonly actionRepo: ActionItemRepository,
    private readonly notificationService: NotificationService,
  ) {}

  async create(input: CreateInput): Promise<ActionItemWithUsers> {
    const item = await this.actionRepo.create({
      ...input,
      dueDate: new Date(input.dueDate),
    });

    await this.notificationService.notify({
      userId: input.assigneeId,
      type: "ACTION_ITEM_ASSIGNED",
      title: "New action item assigned",
      message: `You have been assigned: "${input.title}"`,
      metadata: meta({ actionItemId: item.id, assignedById: input.assignedById }),
    });

    return item;
  }

  async getForUser(userId: string, filters: FindFilters): Promise<ActionItemWithUsers[]> {
    return this.actionRepo.findByAssignee(userId, filters);
  }

  async getForTeam(teamId: string, filters: FindFilters): Promise<ActionItemWithUsers[]> {
    return this.actionRepo.findByTeam(teamId, filters);
  }

  async getPendingApproval(assignedById: string): Promise<ActionItemWithUsers[]> {
    return this.actionRepo.findPendingApproval(assignedById);
  }

  async update(id: string, input: UpdateInput): Promise<ActionItemWithUsers> {
    await this.findOrThrow(id);
    return this.actionRepo.update(id, {
      ...input,
      dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
    });
  }

  async requestDone(id: string, userId: string): Promise<ActionItemWithUsers> {
    const item = await this.findOrThrow(id);
    if (item.assigneeId !== userId) {
      throw new ForbiddenError("Only the assignee can mark this as done");
    }
    if (item.status !== "IN_PROGRESS" && item.status !== "PENDING") {
      throw new ValidationError(`Cannot request done from status "${item.status}"`);
    }

    const updated = await this.actionRepo.update(id, {
      status: "PENDING_APPROVAL",
    });

    await this.notificationService.notify({
      userId: item.assignedById,
      type: "ACTION_ITEM_DONE_REQUEST",
      title: "Action item completion request",
      message: `${item.assignee.name} marked "${item.title}" as done — please review`,
      metadata: meta({ actionItemId: id, assigneeId: userId }),
    });

    return updated;
  }

  async approve(id: string, userId: string): Promise<ActionItemWithUsers> {
    const item = await this.findOrThrow(id);
    if (item.assignedById !== userId) {
      throw new ForbiddenError("Only the assigner can approve");
    }
    if (item.status !== "PENDING_APPROVAL") {
      throw new ValidationError("Item is not pending approval");
    }

    const updated = await this.actionRepo.update(id, {
      status: "DONE",
      completedAt: new Date(),
    });

    await this.notificationService.notify({
      userId: item.assigneeId,
      type: "ACTION_ITEM_APPROVED",
      title: "Action item approved",
      message: `"${item.title}" has been approved as completed`,
      metadata: meta({ actionItemId: id }),
    });

    return updated;
  }

  async reject(id: string, userId: string): Promise<ActionItemWithUsers> {
    const item = await this.findOrThrow(id);
    if (item.assignedById !== userId) {
      throw new ForbiddenError("Only the assigner can reject");
    }
    if (item.status !== "PENDING_APPROVAL") {
      throw new ValidationError("Item is not pending approval");
    }

    const updated = await this.actionRepo.update(id, {
      status: "IN_PROGRESS",
      completedAt: null,
      lastRemindedAt: null,
    });

    await this.notificationService.notify({
      userId: item.assigneeId,
      type: "ACTION_ITEM_REJECTED",
      title: "Action item rejected",
      message: `"${item.title}" was not approved — please continue working on it`,
      metadata: meta({ actionItemId: id }),
    });

    return updated;
  }

  async delete(id: string): Promise<void> {
    await this.findOrThrow(id);
    await this.actionRepo.delete(id);
  }

  async processReminders(): Promise<number> {
    const today = new Date();
    const items = await this.actionRepo.findDueForReminder(today);
    let count = 0;

    for (const item of items) {
      await this.notificationService.notify({
        userId: item.assigneeId,
        type: "ACTION_ITEM_REMINDER",
        title: "Action item reminder",
        message: `Reminder: "${item.title}" is due ${item.dueDate.toISOString().split("T")[0]}`,
        metadata: meta({ actionItemId: item.id }),
      });
      await this.actionRepo.update(item.id, { lastRemindedAt: new Date() });
      count++;
    }

    return count;
  }

  private async findOrThrow(id: string): Promise<ActionItemWithUsers> {
    const item = await this.actionRepo.findById(id);
    if (!item) throw new NotFoundError("Action item not found");
    return item;
  }
}
