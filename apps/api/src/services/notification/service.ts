import type { Notification } from "@prisma/client";
import type {
  NotificationRepository,
  NotificationPreferenceRepository,
} from "../../repositories/notification.repository.js";
import type { NotificationChannel, NotificationPayload } from "./channel.js";

interface FindFilters {
  unreadOnly?: boolean;
  limit?: number;
  offset?: number;
}

export class NotificationService {
  constructor(
    private readonly notifRepo: NotificationRepository,
    private readonly prefRepo: NotificationPreferenceRepository,
    private readonly channels: {
      inApp: NotificationChannel;
      email: NotificationChannel;
      telegram: NotificationChannel;
    },
  ) {}

  async notify(payload: NotificationPayload): Promise<void> {
    const prefs = await this.prefRepo.findByUserId(payload.userId);

    const shouldInApp = prefs?.inApp ?? true;
    const shouldEmail = prefs?.email ?? true;
    const shouldTelegram = prefs?.telegram ?? false;

    const tasks: Promise<void>[] = [];
    if (shouldInApp) tasks.push(this.channels.inApp.send(payload));
    if (shouldEmail) tasks.push(this.channels.email.send(payload));
    if (shouldTelegram) tasks.push(this.channels.telegram.send(payload));

    await Promise.allSettled(tasks);
  }

  async getForUser(userId: string, filters: FindFilters): Promise<Notification[]> {
    return this.notifRepo.findByUser(userId, filters);
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notifRepo.countUnread(userId);
  }

  async markRead(id: string, userId: string): Promise<Notification> {
    return this.notifRepo.markRead(id, userId);
  }

  async markAllRead(userId: string): Promise<void> {
    return this.notifRepo.markAllRead(userId);
  }
}
