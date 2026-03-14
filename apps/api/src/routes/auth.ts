import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { registerSchema, loginSchema } from "@bdaily/shared";
import type { AuthService } from "../services/auth.service.js";
import type { UserRepository } from "../repositories/user.repository.js";
import type { EmailService } from "../services/email.service.js";
import type { PasswordResetRepository } from "../repositories/password-reset.repository.js";
import { NotFoundError } from "../middleware/error-handler.js";

const refreshSchema = z.object({ refreshToken: z.string().min(1) }).strict();

const forgotPasswordSchema = z.object({ email: z.string().email() }).strict();

const resetPasswordSchema = z
  .object({
    token: z.string().min(1),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
  })
  .strict();

const RESET_TOKEN_EXPIRY_MINUTES = 60;
const SALT_ROUNDS = 12;

const APP_URL = process.env.APP_URL ?? "http://localhost:8090";

export function authRoutes(
  authService: AuthService,
  userRepo: UserRepository,
  emailService: EmailService,
  passwordResetRepo: PasswordResetRepository,
): (app: FastifyInstance) => Promise<void> {
  return async (app: FastifyInstance): Promise<void> => {
    app.post("/register", async (request, reply) => {
      const input = registerSchema.parse(request.body);
      const result = await authService.register(input);
      return reply.status(201).send({ data: result, error: null, meta: null });
    });

    app.post("/login", async (request, reply) => {
      const input = loginSchema.parse(request.body);
      const result = await authService.login(input);
      return reply.send({ data: result, error: null, meta: null });
    });

    app.post("/refresh", async (request, reply) => {
      const { refreshToken } = refreshSchema.parse(request.body);
      const result = await authService.refresh(refreshToken);
      return reply.send({ data: result, error: null, meta: null });
    });

    app.post("/forgot-password", async (request, reply) => {
      const { email } = forgotPasswordSchema.parse(request.body);
      const user = await userRepo.findByEmail(email);

      // Always return success to prevent email enumeration
      if (!user) {
        return reply.send({
          data: { message: "If this email exists, a reset link has been sent." },
          error: null,
          meta: null,
        });
      }

      await passwordResetRepo.deleteExpiredForUser(user.id);

      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRY_MINUTES * 60 * 1000);
      await passwordResetRepo.create(user.id, token, expiresAt);

      await emailService.sendTemplated(user.email, "password-reset", {
        name: user.name,
        resetUrl: `${APP_URL}/reset-password?token=${token}`,
        expiryMinutes: String(RESET_TOKEN_EXPIRY_MINUTES),
      });

      return reply.send({
        data: { message: "If this email exists, a reset link has been sent." },
        error: null,
        meta: null,
      });
    });

    app.post("/reset-password", async (request, reply) => {
      const { token, newPassword } = resetPasswordSchema.parse(request.body);

      const resetToken = await passwordResetRepo.findByToken(token);
      if (!resetToken) throw new NotFoundError("Invalid or expired reset token");
      if (resetToken.usedAt) throw new NotFoundError("This reset link has already been used");
      if (resetToken.expiresAt < new Date()) throw new NotFoundError("Reset token has expired");

      const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
      await userRepo.update(resetToken.userId, { passwordHash });
      await passwordResetRepo.markUsed(resetToken.id);

      return reply.send({
        data: { message: "Password has been reset successfully. You can now log in." },
        error: null,
        meta: null,
      });
    });
  };
}
