import { z } from "zod";

export const ticketSchema = z
  .object({
    id: z.string(),
    summary: z.string(),
    state: z.string(),
    type: z.string(),
    priority: z.string(),
    assignee: z.string(),
    sprintName: z.string().optional(),
    estimatedTime: z.string().optional(),
    etaToDev: z.string().optional(),
  })
  .strict();

export const ticketDetailsSchema = ticketSchema
  .extend({
    description: z.string(),
    subtasks: z.array(ticketSchema).default([]),
    linkedTickets: z.array(ticketSchema).default([]),
    customFields: z.record(z.string(), z.unknown()),
  })
  .strict();

export const sprintInfoSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    startDate: z.string(),
    endDate: z.string(),
    goal: z.string().optional(),
  })
  .strict();

export const burndownPointSchema = z
  .object({
    date: z.string(),
    remaining: z.number(),
    ideal: z.number(),
  })
  .strict();
