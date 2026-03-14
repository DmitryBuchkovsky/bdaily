import { describe, it, expect, vi, beforeEach } from "vitest";
import { PrismaPasswordResetRepository } from "../repositories/password-reset.repository.js";

function createMockPrisma() {
  return {
    passwordResetToken: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      deleteMany: vi.fn(),
    },
  };
}

describe("PrismaPasswordResetRepository", () => {
  let prisma: ReturnType<typeof createMockPrisma>;
  let repo: PrismaPasswordResetRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    prisma = createMockPrisma();
    repo = new PrismaPasswordResetRepository(prisma as never);
  });

  describe("create", () => {
    it("calls prisma.passwordResetToken.create with correct data", async () => {
      const expiresAt = new Date("2026-01-02");
      const expected = {
        id: "prt-1",
        userId: "user-1",
        token: "abc123",
        expiresAt,
        usedAt: null,
        createdAt: new Date(),
      };
      prisma.passwordResetToken.create.mockResolvedValue(expected);

      const result = await repo.create("user-1", "abc123", expiresAt);

      expect(prisma.passwordResetToken.create).toHaveBeenCalledWith({
        data: { userId: "user-1", token: "abc123", expiresAt },
      });
      expect(result).toEqual(expected);
    });
  });

  describe("findByToken", () => {
    it("calls prisma.passwordResetToken.findUnique with token", async () => {
      const expected = { id: "prt-1", token: "abc123" };
      prisma.passwordResetToken.findUnique.mockResolvedValue(expected);

      const result = await repo.findByToken("abc123");

      expect(prisma.passwordResetToken.findUnique).toHaveBeenCalledWith({
        where: { token: "abc123" },
      });
      expect(result).toEqual(expected);
    });
  });

  describe("markUsed", () => {
    it("calls prisma.passwordResetToken.update with usedAt", async () => {
      prisma.passwordResetToken.update.mockResolvedValue({});

      await repo.markUsed("prt-1");

      expect(prisma.passwordResetToken.update).toHaveBeenCalledWith({
        where: { id: "prt-1" },
        data: { usedAt: expect.any(Date) },
      });
    });
  });

  describe("deleteExpiredForUser", () => {
    it("calls prisma.passwordResetToken.deleteMany with correct where clause", async () => {
      prisma.passwordResetToken.deleteMany.mockResolvedValue({ count: 2 });

      await repo.deleteExpiredForUser("user-1");

      expect(prisma.passwordResetToken.deleteMany).toHaveBeenCalledWith({
        where: { userId: "user-1", expiresAt: { lt: expect.any(Date) } },
      });
    });
  });
});
