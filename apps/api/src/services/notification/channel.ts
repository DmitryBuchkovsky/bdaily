import type { NotificationType } from "@prisma/client";
import type { InputJsonValue } from "@prisma/client/runtime/library";

export interface NotificationPayload {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata?: InputJsonValue;
}

export interface NotificationChannel {
  send(payload: NotificationPayload): Promise<void>;
}
