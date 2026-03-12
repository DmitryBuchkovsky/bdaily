import { z } from "zod";
import { completedItemSchema, blockerSchema, testedTicketSchema } from "./daily.js";

export const personSummarySchema = z.object({
  userId: z.string().uuid(),
  userName: z.string(),
  period: z.object({
    start: z.coerce.date(),
    end: z.coerce.date(),
  }),
  ticketsCompleted: z.number().int().nonnegative(),
  bugsFixes: z.number().int().nonnegative(),
  ticketsTested: z.number().int().nonnegative(),
  testApproved: z.number().int().nonnegative(),
  testRejected: z.number().int().nonnegative(),
  blockersRaised: z.number().int().nonnegative(),
  blockersResolved: z.number().int().nonnegative(),
  dailiesFilled: z.number().int().nonnegative(),
  prCount: z.number().int().nonnegative(),
  completedItems: z.array(completedItemSchema.extend({ id: z.string().uuid() })),
  activeBlockers: z.array(blockerSchema.extend({ id: z.string().uuid() })),
  testedTickets: z.array(testedTicketSchema.extend({ id: z.string().uuid() })),
});

export const sprintSummarySchema = z.object({
  sprintId: z.string().min(1),
  sprintName: z.string().min(1),
  dates: z.object({
    start: z.coerce.date(),
    end: z.coerce.date(),
  }),
  totalStories: z.number().int().nonnegative(),
  completedStories: z.number().int().nonnegative(),
  totalBugs: z.number().int().nonnegative(),
  fixedBugs: z.number().int().nonnegative(),
  activeBlockers: z.number().int().nonnegative(),
  memberSummaries: z.array(personSummarySchema),
});
