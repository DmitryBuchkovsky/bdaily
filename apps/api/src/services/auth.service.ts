import bcrypt from "bcryptjs";
import type { UserRepository } from "../repositories/user.repository.js";
import {
  ConflictError,
  UnauthorizedError,
} from "../middleware/error-handler.js";

export interface JwtFunctions {
  sign(payload: { sub: string; role: string }, options: { expiresIn: string }): string;
  verify(token: string): { sub: string; role: string };
}

interface AuthResponse {
  user: { id: string; email: string; name: string; role: string };
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  private readonly SALT_ROUNDS = 12;
  private readonly ACCESS_EXPIRY = "15m";
  private readonly REFRESH_EXPIRY = "7d";

  constructor(
    private readonly userRepo: UserRepository,
    private readonly jwt: JwtFunctions,
  ) {}

  async register(input: {
    email: string;
    password: string;
    name: string;
    teamId: string;
  }): Promise<AuthResponse> {
    const existing = await this.userRepo.findByEmail(input.email);
    if (existing) {
      throw new ConflictError("A user with this email already exists");
    }

    const passwordHash = await bcrypt.hash(input.password, this.SALT_ROUNDS);
    const user = await this.userRepo.create({
      email: input.email,
      name: input.name,
      passwordHash,
      teamId: input.teamId,
    });

    const tokens = this.signTokens({ id: user.id, role: user.role });
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      ...tokens,
    };
  }

  async login(input: {
    email: string;
    password: string;
  }): Promise<AuthResponse> {
    const user = await this.userRepo.findByEmail(input.email);
    if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const tokens = this.signTokens({ id: user.id, role: user.role });
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      ...tokens,
    };
  }

  async refresh(refreshToken: string): Promise<AuthResponse> {
    let payload: { sub: string; role: string };
    try {
      payload = this.jwt.verify(refreshToken);
    } catch {
      throw new UnauthorizedError("Invalid or expired refresh token");
    }

    const user = await this.userRepo.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedError("User not found");
    }

    const tokens = this.signTokens({ id: user.id, role: user.role });
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      ...tokens,
    };
  }

  private signTokens(user: {
    id: string;
    role: string;
  }): { accessToken: string; refreshToken: string } {
    const accessToken = this.jwt.sign(
      { sub: user.id, role: user.role },
      { expiresIn: this.ACCESS_EXPIRY },
    );
    const refreshToken = this.jwt.sign(
      { sub: user.id, role: user.role },
      { expiresIn: this.REFRESH_EXPIRY },
    );
    return { accessToken, refreshToken };
  }
}
