import { z } from "zod";
import {
  CompletedItemType,
  CompletedItemStatus,
  TodayItemPriority,
  BlockerType,
  QuestionType,
  TestResult,
} from "../enums.js";

export const completedItemSchema = z
  .object({
    type: CompletedItemType,
    ticketId: z.string().optional(),
    title: z.string().min(1, "Title is required"),
    details: z.string().default(""),
    status: CompletedItemStatus,
    prLink: z.string().optional(),
    commitHash: z.string().optional(),
    rootCause: z.string().optional(),
    solution: z.string().optional(),
    impact: z.string().optional(),
  })
  .strict();

export const todayItemSchema = z
  .object({
    priority: TodayItemPriority,
    ticketId: z.string().optional(),
    title: z.string().min(1, "Title is required"),
    goal: z.string().optional(),
    approach: z.string().optional(),
    etaToDev: z.string().optional(),
  })
  .strict();

export const blockerSchema = z
  .object({
    type: BlockerType,
    description: z.string().min(1, "Description is required"),
    impact: z.string().optional(),
    need: z.string().optional(),
    waitingFor: z.string().optional(),
    expectedResolution: z.string().optional(),
  })
  .strict();

export const additionalNotesSchema = z
  .object({
    codeReviewRequests: z.string().optional(),
    testingStatus: z.string().optional(),
    deploymentNotes: z.string().optional(),
    learningResearch: z.string().optional(),
  })
  .strict();

export const questionSchema = z
  .object({
    type: QuestionType,
    content: z.string().min(1, "Question content is required"),
  })
  .strict();

export const testedTicketSchema = z
  .object({
    ticketId: z.string().min(1, "Ticket ID is required"),
    title: z.string().min(1, "Title is required"),
    result: TestResult,
  })
  .strict();

export const createDailyReportSchema = z
  .object({
    date: z.string().date("Must be a valid ISO date (YYYY-MM-DD)"),
    completedItems: z.array(completedItemSchema).default([]),
    todayItems: z.array(todayItemSchema).default([]),
    blockers: z.array(blockerSchema).default([]),
    notes: additionalNotesSchema.optional(),
    questions: z.array(questionSchema).default([]),
    testedTickets: z.array(testedTicketSchema).default([]),
  })
  .strict();

export const dailyReportResponseSchema = z
  .object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
    date: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
    completedItems: z.array(
      completedItemSchema.extend({ id: z.string().uuid() }).strict(),
    ),
    todayItems: z.array(
      todayItemSchema.extend({ id: z.string().uuid() }).strict(),
    ),
    blockers: z.array(
      blockerSchema.extend({ id: z.string().uuid() }).strict(),
    ),
    notes: additionalNotesSchema
      .extend({ id: z.string().uuid() })
      .strict()
      .optional(),
    questions: z.array(
      questionSchema.extend({ id: z.string().uuid() }).strict(),
    ),
    testedTickets: z.array(
      testedTicketSchema.extend({ id: z.string().uuid() }).strict(),
    ),
  })
  .strict();
