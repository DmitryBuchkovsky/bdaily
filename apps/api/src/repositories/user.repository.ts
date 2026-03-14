import type { PrismaClient, User, Prisma } from "@prisma/client";

export type UserWithTeam = Prisma.UserGetPayload<{ include: { team: true } }>;

interface CreateUserData {
  email: string;
  name: string;
  passwordHash: string;
  teamId: string;
  role?: "ADMIN" | "MEMBER";
}

interface UpdateUserData {
  name?: string;
  role?: "ADMIN" | "MEMBER";
  teamId?: string;
  passwordHash?: string;
  isActive?: boolean;
}

export interface UserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  findByIdWithTeam(id: string): Promise<UserWithTeam | null>;
  findByTeamId(teamId: string): Promise<User[]>;
  create(data: CreateUserData): Promise<User>;
  update(id: string, data: UpdateUserData): Promise<User>;
  delete(id: string): Promise<void>;
}

export class PrismaUserRepository implements UserRepository {
  constructor(private readonly db: PrismaClient) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.db.user.findUnique({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.db.user.findUnique({ where: { id } });
  }

  async findByIdWithTeam(id: string): Promise<UserWithTeam | null> {
    return this.db.user.findUnique({
      where: { id },
      include: { team: true },
    });
  }

  async findByTeamId(teamId: string): Promise<User[]> {
    return this.db.user.findMany({
      where: { teamId },
      orderBy: { name: "asc" },
    });
  }

  async create(data: CreateUserData): Promise<User> {
    return this.db.user.create({ data });
  }

  async update(id: string, data: UpdateUserData): Promise<User> {
    return this.db.user.update({ where: { id }, data });
  }

  async delete(id: string): Promise<void> {
    await this.db.user.delete({ where: { id } });
  }
}
