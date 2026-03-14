import type {
  PrismaClient,
  Notification,
  NotificationType,
  NotificationPreference,
} from "@prisma/client";

import type { InputJsonValue } from "@prisma/client/runtime/library";

interface CreateNotificationData {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata?: InputJsonValue;
}

interface FindFilters {
  unreadOnly?: boolean;
  limit?: number;
  offset?: number;
}

export interface NotificationRepository {
  create(data: CreateNotificationData): Promise<Notification>;
  findByUser(userId: string, filters: FindFilters): Promise<Notification[]>;
  countUnread(userId: string): Promise<number>;
  markRead(id: string, userId: string): Promise<Notification>;
  markAllRead(userId: string): Promise<void>;
}

export class PrismaNotificationRepository implements NotificationRepository {
  constructor(private readonly db: PrismaClient) {}

  async create(data: CreateNotificationData): Promise<Notification> {
    return this.db.notification.create({ data });
  }

  async findByUser(userId: string, filters: FindFilters): Promise<Notification[]> {
    return this.db.notification.findMany({
      where: {
        userId,
        ...(filters.unreadOnly ? { read: false } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: filters.limit ?? 20,
      skip: filters.offset ?? 0,
    });
  }

  async countUnread(userId: string): Promise<number> {
    return this.db.notification.count({
      where: { userId, read: false },
    });
  }

  async markRead(id: string, userId: string): Promise<Notification> {
    return this.db.notification.update({
      where: { id, userId },
      data: { read: true, readAt: new Date() },
    });
  }

  async markAllRead(userId: string): Promise<void> {
    await this.db.notification.updateMany({
      where: { userId, read: false },
      data: { read: true, readAt: new Date() },
    });
  }
}

export interface NotificationPreferenceRepository {
  findByUserId(userId: string): Promise<NotificationPreference | null>;
  upsert(
    userId: string,
    data: Partial<{
      email: boolean;
      inApp: boolean;
      telegram: boolean;
      telegramChatId: string | null;
    }>,
  ): Promise<NotificationPreference>;
}

export class PrismaNotificationPreferenceRepository implements NotificationPreferenceRepository {
  constructor(private readonly db: PrismaClient) {}

  async findByUserId(userId: string): Promise<NotificationPreference | null> {
    return this.db.notificationPreference.findUnique({
      where: { userId },
    });
  }

  async upsert(
    userId: string,
    data: Partial<{
      email: boolean;
      inApp: boolean;
      telegram: boolean;
      telegramChatId: string | null;
    }>,
  ): Promise<NotificationPreference> {
    return this.db.notificationPreference.upsert({
      where: { userId },
      create: { userId, ...data },
      update: data,
    });
  }
}
