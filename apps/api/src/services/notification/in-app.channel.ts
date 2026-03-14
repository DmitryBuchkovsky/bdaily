import type { NotificationRepository } from "../../repositories/notification.repository.js";
import type { NotificationChannel, NotificationPayload } from "./channel.js";

export class InAppChannel implements NotificationChannel {
  constructor(private readonly notifRepo: NotificationRepository) {}

  async send(payload: NotificationPayload): Promise<void> {
    await this.notifRepo.create({
      userId: payload.userId,
      type: payload.type,
      title: payload.title,
      message: payload.message,
      metadata: payload.metadata,
    });
  }
}
