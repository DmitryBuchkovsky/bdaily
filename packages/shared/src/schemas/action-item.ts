import { z } from "zod";

export const ActionItemStatus = z.enum([
  "PENDING",
  "IN_PROGRESS",
  "PENDING_APPROVAL",
  "DONE",
  "REJECTED",
  "OVERDUE",
]);
export type ActionItemStatus = z.infer<typeof ActionItemStatus>;

export const createActionItemSchema = z
  .object({
    assigneeId: z.string().uuid("Valid assignee ID is required"),
    title: z.string().min(1, "Title is required").max(200),
    description: z.string().optional(),
    dueDate: z.string().date("Must be a valid ISO date (YYYY-MM-DD)"),
    dailyReportId: z.string().uuid().optional(),
  })
  .strict();

export const updateActionItemSchema = z
  .object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().optional(),
    dueDate: z.string().date().optional(),
  })
  .strict();

export const actionItemResponseSchema = z.object({
  id: z.string().uuid(),
  assignedById: z.string().uuid(),
  assigneeId: z.string().uuid(),
  teamId: z.string().uuid(),
  dailyReportId: z.string().uuid().nullable(),
  title: z.string(),
  description: z.string().nullable(),
  dueDate: z.string(),
  status: ActionItemStatus,
  completedAt: z.string().nullable(),
  lastRemindedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  assignedBy: z.object({ id: z.string(), name: z.string() }),
  assignee: z.object({ id: z.string(), name: z.string() }),
});
