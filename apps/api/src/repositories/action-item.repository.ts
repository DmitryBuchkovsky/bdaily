import type { PrismaClient, ActionItemStatus, Prisma } from "@prisma/client";

const includeRelations = {
  assignedBy: { select: { id: true, name: true } },
  assignee: { select: { id: true, name: true } },
} satisfies Prisma.ActionItemInclude;

export type ActionItemWithUsers = Prisma.ActionItemGetPayload<{
  include: typeof includeRelations;
}>;

interface CreateData {
  assignedById: string;
  assigneeId: string;
  teamId: string;
  title: string;
  description?: string;
  dueDate: Date;
  dailyReportId?: string;
}

interface UpdateData {
  title?: string;
  description?: string;
  dueDate?: Date;
  status?: ActionItemStatus;
  completedAt?: Date | null;
  lastRemindedAt?: Date | null;
}

interface FindFilters {
  status?: ActionItemStatus;
}

export interface ActionItemRepository {
  create(data: CreateData): Promise<ActionItemWithUsers>;
  findById(id: string): Promise<ActionItemWithUsers | null>;
  findByAssignee(userId: string, filters: FindFilters): Promise<ActionItemWithUsers[]>;
  findByTeam(teamId: string, filters: FindFilters): Promise<ActionItemWithUsers[]>;
  findPendingApproval(assignedById: string): Promise<ActionItemWithUsers[]>;
  findDueForReminder(today: Date): Promise<ActionItemWithUsers[]>;
  update(id: string, data: UpdateData): Promise<ActionItemWithUsers>;
  delete(id: string): Promise<void>;
}

export class PrismaActionItemRepository implements ActionItemRepository {
  constructor(private readonly db: PrismaClient) {}

  async create(data: CreateData): Promise<ActionItemWithUsers> {
    return this.db.actionItem.create({
      data,
      include: includeRelations,
    });
  }

  async findById(id: string): Promise<ActionItemWithUsers | null> {
    return this.db.actionItem.findUnique({
      where: { id },
      include: includeRelations,
    });
  }

  async findByAssignee(userId: string, filters: FindFilters): Promise<ActionItemWithUsers[]> {
    return this.db.actionItem.findMany({
      where: {
        assigneeId: userId,
        ...(filters.status ? { status: filters.status } : {}),
      },
      include: includeRelations,
      orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
    });
  }

  async findByTeam(teamId: string, filters: FindFilters): Promise<ActionItemWithUsers[]> {
    return this.db.actionItem.findMany({
      where: {
        teamId,
        ...(filters.status ? { status: filters.status } : {}),
      },
      include: includeRelations,
      orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
    });
  }

  async findPendingApproval(assignedById: string): Promise<ActionItemWithUsers[]> {
    return this.db.actionItem.findMany({
      where: { assignedById, status: "PENDING_APPROVAL" },
      include: includeRelations,
      orderBy: { updatedAt: "desc" },
    });
  }

  async findDueForReminder(today: Date): Promise<ActionItemWithUsers[]> {
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);

    return this.db.actionItem.findMany({
      where: {
        status: { in: ["PENDING", "IN_PROGRESS"] },
        dueDate: { gte: startOfDay },
        OR: [{ lastRemindedAt: null }, { lastRemindedAt: { lt: startOfDay } }],
      },
      include: includeRelations,
    });
  }

  async update(id: string, data: UpdateData): Promise<ActionItemWithUsers> {
    return this.db.actionItem.update({
      where: { id },
      data,
      include: includeRelations,
    });
  }

  async delete(id: string): Promise<void> {
    await this.db.actionItem.delete({ where: { id } });
  }
}
