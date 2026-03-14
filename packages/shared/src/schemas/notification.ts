import { z } from "zod";

export const NotificationType = z.enum([
  "MENTION",
  "ACTION_ITEM_ASSIGNED",
  "ACTION_ITEM_REMINDER",
  "ACTION_ITEM_DONE_REQUEST",
  "ACTION_ITEM_APPROVED",
  "ACTION_ITEM_REJECTED",
  "TEAM_INVITE",
  "REPORT_COMMENT",
]);
export type NotificationType = z.infer<typeof NotificationType>;

export const notificationResponseSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  type: NotificationType,
  title: z.string(),
  message: z.string(),
  metadata: z.record(z.string(), z.unknown()).nullable(),
  read: z.boolean(),
  readAt: z.string().nullable(),
  createdAt: z.string(),
});

export const notificationListQuerySchema = z.object({
  unread: z
    .string()
    .transform((v) => v === "true")
    .optional(),
  limit: z.string().transform(Number).pipe(z.number().int().min(1).max(100)).optional(),
  offset: z.string().transform(Number).pipe(z.number().int().min(0)).optional(),
});
