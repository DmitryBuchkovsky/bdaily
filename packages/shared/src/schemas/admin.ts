import { z } from "zod";
import { UserRole } from "../enums.js";

export const addMemberSchema = z
  .object({
    email: z.string().email("Valid email is required"),
    name: z.string().min(1, "Name is required").max(100),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: UserRole.default("MEMBER"),
  })
  .strict();

export const updateMemberSchema = z
  .object({
    name: z.string().min(1).max(100).optional(),
    role: UserRole.optional(),
    teamId: z.string().uuid().optional(),
  })
  .strict();
