import type { FastifyInstance } from "fastify";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";
import {
  ConflictError,
  UnauthorizedError,
  ValidationError,
} from "../middleware/error-handler.js";

interface RegisterBody {
  email: string;
  password: string;
  name: string;
  teamId: string;
}

interface LoginBody {
  email: string;
  password: string;
}

interface RefreshBody {
  refreshToken: string;
}

const SALT_ROUNDS = 12;
const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY = "7d";

export async function authRoutes(app: FastifyInstance) {
  app.post<{ Body: RegisterBody }>("/register", async (request, reply) => {
    const { email, password, name, teamId } = request.body;

    if (!email || !password || !name || !teamId) {
      throw new ValidationError("email, password, name, and teamId are required");
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictError("A user with this email already exists");
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: { email, name, passwordHash, teamId },
      select: { id: true, email: true, name: true, role: true },
    });

    const accessToken = app.jwt.sign(
      { sub: user.id, role: user.role },
      { expiresIn: ACCESS_TOKEN_EXPIRY },
    );
    const refreshToken = app.jwt.sign(
      { sub: user.id, role: user.role },
      { expiresIn: REFRESH_TOKEN_EXPIRY },
    );

    return reply.status(201).send({
      data: { user, accessToken, refreshToken },
      error: null,
      meta: null,
    });
  });

  app.post<{ Body: LoginBody }>("/login", async (request, reply) => {
    const { email, password } = request.body;

    if (!email || !password) {
      throw new ValidationError("email and password are required");
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, role: true, passwordHash: true },
    });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const { passwordHash: _, ...safeUser } = user;

    const accessToken = app.jwt.sign(
      { sub: user.id, role: user.role },
      { expiresIn: ACCESS_TOKEN_EXPIRY },
    );
    const refreshToken = app.jwt.sign(
      { sub: user.id, role: user.role },
      { expiresIn: REFRESH_TOKEN_EXPIRY },
    );

    return reply.send({
      data: { user: safeUser, accessToken, refreshToken },
      error: null,
      meta: null,
    });
  });

  app.post<{ Body: RefreshBody }>("/refresh", async (request, reply) => {
    const { refreshToken } = request.body;

    if (!refreshToken) {
      throw new ValidationError("refreshToken is required");
    }

    let payload: { sub: string; role: string };
    try {
      payload = app.jwt.verify<{ sub: string; role: string }>(refreshToken);
    } catch {
      throw new UnauthorizedError("Invalid or expired refresh token");
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, name: true, role: true },
    });

    if (!user) {
      throw new UnauthorizedError("User not found");
    }

    const accessToken = app.jwt.sign(
      { sub: user.id, role: user.role },
      { expiresIn: ACCESS_TOKEN_EXPIRY },
    );
    const newRefreshToken = app.jwt.sign(
      { sub: user.id, role: user.role },
      { expiresIn: REFRESH_TOKEN_EXPIRY },
    );

    return reply.send({
      data: { user, accessToken, refreshToken: newRefreshToken },
      error: null,
      meta: null,
    });
  });
}
