import type { NotificationChannel, NotificationPayload } from "./channel.js";
import type { NotificationPreferenceRepository } from "../../repositories/notification.repository.js";

export class TelegramChannel implements NotificationChannel {
  constructor(
    private readonly botToken: string | undefined,
    private readonly prefRepo: NotificationPreferenceRepository,
  ) {}

  async send(payload: NotificationPayload): Promise<void> {
    if (!this.botToken) return;

    const prefs = await this.prefRepo.findByUserId(payload.userId);
    if (!prefs?.telegramChatId) return;

    const text = `*${payload.title}*\n${payload.message}`;
    const url = `https://api.telegram.org/bot${this.botToken}/sendMessage`;

    try {
      await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: prefs.telegramChatId,
          text,
          parse_mode: "Markdown",
        }),
      });
    } catch (err) {
      console.error("Telegram notification failed:", err);
    }
  }
}
