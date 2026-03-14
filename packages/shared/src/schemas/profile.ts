import { z } from "zod";

export const updateProfileSchema = z
  .object({
    name: z.string().min(1).max(100).optional(),
  })
  .strict();

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "New password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .strict()
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const notificationPreferenceSchema = z
  .object({
    email: z.boolean().optional(),
    inApp: z.boolean().optional(),
    telegram: z.boolean().optional(),
    telegramChatId: z.string().nullable().optional(),
  })
  .strict();
