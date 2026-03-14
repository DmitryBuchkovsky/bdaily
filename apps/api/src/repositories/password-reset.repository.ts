import type { PrismaClient, PasswordResetToken } from "@prisma/client";

export interface PasswordResetRepository {
  create(userId: string, token: string, expiresAt: Date): Promise<PasswordResetToken>;
  findByToken(token: string): Promise<PasswordResetToken | null>;
  markUsed(id: string): Promise<void>;
  deleteExpiredForUser(userId: string): Promise<void>;
}

export class PrismaPasswordResetRepository implements PasswordResetRepository {
  constructor(private readonly db: PrismaClient) {}

  async create(userId: string, token: string, expiresAt: Date): Promise<PasswordResetToken> {
    return this.db.passwordResetToken.create({
      data: { userId, token, expiresAt },
    });
  }

  async findByToken(token: string): Promise<PasswordResetToken | null> {
    return this.db.passwordResetToken.findUnique({ where: { token } });
  }

  async markUsed(id: string): Promise<void> {
    await this.db.passwordResetToken.update({
      where: { id },
      data: { usedAt: new Date() },
    });
  }

  async deleteExpiredForUser(userId: string): Promise<void> {
    await this.db.passwordResetToken.deleteMany({
      where: { userId, expiresAt: { lt: new Date() } },
    });
  }
}
