import type { NotificationChannel, NotificationPayload } from "./channel.js";
import type { UserRepository } from "../../repositories/user.repository.js";
import type { EmailService } from "../email.service.js";

const TYPE_TO_SLUG: Record<string, string> = {
  MENTION: "mention",
  ACTION_ITEM: "action-item-assigned",
  ACTION_ITEM_REMINDER: "action-item-reminder",
  COMMENT: "report-comment",
};

export class EmailChannel implements NotificationChannel {
  constructor(
    private readonly emailService: EmailService,
    private readonly userRepo: UserRepository,
  ) {}

  async send(payload: NotificationPayload): Promise<void> {
    const user = await this.userRepo.findById(payload.userId);
    if (!user) return;

    const slug = TYPE_TO_SLUG[payload.type];
    if (slug) {
      const meta = (payload.metadata ?? {}) as Record<string, string>;
      await this.emailService.sendTemplated(user.email, slug, {
        name: user.name,
        ...meta,
      });
    } else {
      await this.emailService.sendRaw(user.email, payload.title, `<p>${payload.message}</p>`);
    }
  }
}
