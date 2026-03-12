import { z } from "zod";
import { UserRole } from "../enums.js";

export const loginSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
  })
  .strict();

export const registerSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    name: z.string().min(1, "Name is required"),
    teamId: z.string().uuid("Invalid team ID"),
  })
  .strict();

export const authUserSchema = z
  .object({
    id: z.string().uuid(),
    email: z.string().email(),
    name: z.string(),
    role: UserRole,
  })
  .strict();

export const authResponseSchema = z
  .object({
    accessToken: z.string(),
    refreshToken: z.string(),
    user: authUserSchema,
  })
  .strict();
