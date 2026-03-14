import { z } from "zod";
import { TicketSystemType } from "../enums.js";

export const ticketSystemConfigSchema = z
  .object({
    baseUrl: z.string().url("Must be a valid URL"),
    projectIds: z.array(z.string().min(1)).min(1, "At least one project ID"),
    token: z.string().optional(),
  })
  .strict();

export const createTeamSchema = z
  .object({
    name: z.string().min(1, "Team name is required").max(100),
    ticketSystemType: TicketSystemType,
    ticketSystemConfig: ticketSystemConfigSchema,
  })
  .strict();

export const updateTeamSchema = z
  .object({
    name: z.string().min(1).max(100).optional(),
    ticketSystemType: TicketSystemType.optional(),
    ticketSystemConfig: ticketSystemConfigSchema.optional(),
  })
  .strict();

export const teamResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  ticketSystemType: TicketSystemType,
  ticketSystemConfig: ticketSystemConfigSchema,
  memberCount: z.number().int(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
