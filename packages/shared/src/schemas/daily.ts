import { z } from "zod";
import {
  CompletedItemType,
  CompletedItemStatus,
  TodayItemPriority,
  BlockerType,
  QuestionType,
  TestResult,
} from "../enums.js";

export const completedItemSchema = z.object({
  ticketId: z.string().min(1, "Ticket ID is required"),
  title: z.string().min(1, "Title is required"),
  type: CompletedItemType,
  status: CompletedItemStatus,
  prUrl: z.string().url("Invalid PR URL").optional(),
  notes: z.string().optional(),
});

export const todayItemSchema = z.object({
  ticketId: z.string().min(1, "Ticket ID is required"),
  title: z.string().min(1, "Title is required"),
  priority: TodayItemPriority,
  estimatedHours: z
    .number()
    .positive("Estimated hours must be positive")
    .optional(),
  notes: z.string().optional(),
});

export const blockerSchema = z.object({
  type: BlockerType,
  description: z.string().min(1, "Description is required"),
  ticketId: z.string().optional(),
  isResolved: z.boolean().default(false),
  resolvedAt: z.coerce.date().optional(),
});

export const additionalNotesSchema = z.object({
  content: z.string().min(1, "Content is required"),
});

export const questionSchema = z.object({
  type: QuestionType,
  content: z.string().min(1, "Question content is required"),
  targetPerson: z.string().optional(),
  isAnswered: z.boolean().default(false),
  answer: z.string().optional(),
});

export const testedTicketSchema = z.object({
  ticketId: z.string().min(1, "Ticket ID is required"),
  title: z.string().min(1, "Title is required"),
  result: TestResult,
  notes: z.string().optional(),
});

export const createDailyReportSchema = z.object({
  completedItems: z.array(completedItemSchema).default([]),
  todayItems: z.array(todayItemSchema).default([]),
  blockers: z.array(blockerSchema).default([]),
  additionalNotes: z.array(additionalNotesSchema).default([]),
  questions: z.array(questionSchema).default([]),
  testedTickets: z.array(testedTicketSchema).default([]),
});

export const dailyReportResponseSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  reportDate: z.coerce.date(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  completedItems: z.array(
    completedItemSchema.extend({ id: z.string().uuid() }),
  ),
  todayItems: z.array(todayItemSchema.extend({ id: z.string().uuid() })),
  blockers: z.array(blockerSchema.extend({ id: z.string().uuid() })),
  additionalNotes: z.array(
    additionalNotesSchema.extend({ id: z.string().uuid() }),
  ),
  questions: z.array(questionSchema.extend({ id: z.string().uuid() })),
  testedTickets: z.array(
    testedTicketSchema.extend({ id: z.string().uuid() }),
  ),
});
