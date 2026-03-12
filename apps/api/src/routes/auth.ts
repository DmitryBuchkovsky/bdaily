import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { registerSchema, loginSchema } from "@bdaily/shared";
import type { AuthService } from "../services/auth.service.js";

const refreshSchema = z.object({ refreshToken: z.string().min(1) }).strict();

export function authRoutes(
  authService: AuthService,
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
  };
}
