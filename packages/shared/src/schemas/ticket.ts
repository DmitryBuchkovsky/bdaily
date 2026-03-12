import { z } from "zod";

export const ticketSchema = z.object({
  id: z.string().min(1),
  key: z.string().min(1),
  summary: z.string(),
  status: z.string(),
  assignee: z.string().optional(),
  type: z.string().optional(),
  priority: z.string().optional(),
  sprintName: z.string().optional(),
  url: z.string().url().optional(),
});

export const ticketDetailsSchema = ticketSchema.extend({
  description: z.string().optional(),
  created: z.coerce.date(),
  updated: z.coerce.date(),
  resolved: z.coerce.date().optional(),
  estimatedHours: z.number().nonnegative().optional(),
  spentHours: z.number().nonnegative().optional(),
  tags: z.array(z.string()).default([]),
  subtasks: z.array(ticketSchema).default([]),
});

export const sprintInfoSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  goal: z.string().optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  isActive: z.boolean(),
  totalStories: z.number().int().nonnegative(),
  completedStories: z.number().int().nonnegative(),
  totalBugs: z.number().int().nonnegative(),
  fixedBugs: z.number().int().nonnegative(),
});

export const burndownPointSchema = z.object({
  date: z.coerce.date(),
  idealRemaining: z.number().nonnegative(),
  actualRemaining: z.number().nonnegative(),
});
