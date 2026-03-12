import { z } from "zod";

import {
  loginSchema,
  registerSchema,
  authUserSchema,
  authResponseSchema,
} from "./schemas/auth.js";

import {
  completedItemSchema,
  todayItemSchema,
  blockerSchema,
  additionalNotesSchema,
  questionSchema,
  testedTicketSchema,
  createDailyReportSchema,
  dailyReportResponseSchema,
} from "./schemas/daily.js";

import {
  ticketSchema,
  ticketDetailsSchema,
  sprintInfoSchema,
  burndownPointSchema,
} from "./schemas/ticket.js";

import {
  personSummarySchema,
  sprintSummarySchema,
} from "./schemas/summary.js";

// Auth types
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type AuthUser = z.infer<typeof authUserSchema>;
export type AuthResponse = z.infer<typeof authResponseSchema>;

// Daily report types
export type CompletedItem = z.infer<typeof completedItemSchema>;
export type TodayItem = z.infer<typeof todayItemSchema>;
export type Blocker = z.infer<typeof blockerSchema>;
export type AdditionalNotes = z.infer<typeof additionalNotesSchema>;
export type Question = z.infer<typeof questionSchema>;
export type TestedTicket = z.infer<typeof testedTicketSchema>;
export type CreateDailyReportInput = z.infer<typeof createDailyReportSchema>;
export type DailyReportResponse = z.infer<typeof dailyReportResponseSchema>;

// Ticket types
export type Ticket = z.infer<typeof ticketSchema>;
export type TicketDetails = z.infer<typeof ticketDetailsSchema>;
export type SprintInfo = z.infer<typeof sprintInfoSchema>;
export type BurndownPoint = z.infer<typeof burndownPointSchema>;

// Summary types
export type PersonSummary = z.infer<typeof personSummarySchema>;
export type SprintSummary = z.infer<typeof sprintSummarySchema>;
