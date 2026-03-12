import type { FastifyRequest, FastifyReply } from "fastify";
import { UnauthorizedError } from "./error-handler.js";
import { prisma } from "../lib/prisma.js";

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: { sub: string; role: string };
    user: { sub: string; role: string };
  }
}

export async function authenticate(
  request: FastifyRequest,
  _reply: FastifyReply,
) {
  try {
    await request.jwtVerify();
  } catch {
    throw new UnauthorizedError("Invalid or expired token");
  }
}

export async function attachUser(
  request: FastifyRequest,
  _reply: FastifyReply,
) {
  await authenticate(request, _reply);

  const user = await prisma.user.findUnique({
    where: { id: request.user.sub },
    select: { id: true, email: true, name: true, role: true, teamId: true },
  });

  if (!user) {
    throw new UnauthorizedError("User not found");
  }

  (request as FastifyRequest & { currentUser: typeof user }).currentUser = user;
}
