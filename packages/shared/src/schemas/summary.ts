import { z } from "zod";
import {
  completedItemSchema,
  blockerSchema,
  testedTicketSchema,
} from "./daily.js";

export const personSummarySchema = z
  .object({
    userId: z.string().uuid(),
    period: z
      .object({
        from: z.string(),
        to: z.string(),
        sprintId: z.string().optional(),
      })
      .strict(),
    stats: z
      .object({
        totalReports: z.number().int().nonnegative(),
        totalCompleted: z.number().int().nonnegative(),
        totalBugsFixed: z.number().int().nonnegative(),
        totalTasksDone: z.number().int().nonnegative(),
        totalBlockers: z.number().int().nonnegative(),
        unresolvedBlockers: z.number().int().nonnegative(),
        totalTested: z.number().int().nonnegative(),
        totalApproved: z.number().int().nonnegative(),
        totalRejected: z.number().int().nonnegative(),
        prCount: z.number().int().nonnegative(),
      })
      .strict(),
    completedItems: z.array(
      completedItemSchema.extend({ id: z.string().uuid() }).strict(),
    ),
    activeBlockers: z.array(
      blockerSchema.extend({ id: z.string().uuid() }).strict(),
    ),
    testedTickets: z.array(
      testedTicketSchema.extend({ id: z.string().uuid() }).strict(),
    ),
  })
  .strict();

export const sprintSummarySchema = z
  .object({
    sprintId: z.string(),
    sprintName: z.string(),
    startDate: z.string(),
    endDate: z.string(),
    stats: z
      .object({
        totalStories: z.number().int().nonnegative(),
        completedStories: z.number().int().nonnegative(),
        totalBugs: z.number().int().nonnegative(),
        fixedBugs: z.number().int().nonnegative(),
        activeBlockers: z.number().int().nonnegative(),
      })
      .strict(),
    memberSummaries: z.array(personSummarySchema),
  })
  .strict();

export const teamSummarySchema = z
  .object({
    teamId: z.string().uuid(),
    period: z
      .object({
        from: z.string(),
        to: z.string(),
      })
      .strict(),
    memberSummaries: z.array(personSummarySchema),
  })
  .strict();
