import { describe, it, expect, vi, beforeEach } from "vitest";
import bcrypt from "bcryptjs";
import type { User } from "@prisma/client";
import { AuthService } from "../services/auth.service.js";
import type { JwtFunctions } from "../services/auth.service.js";
import type { UserRepository } from "../repositories/user.repository.js";
import { ConflictError, UnauthorizedError } from "../middleware/error-handler.js";

const TEST_HASH = bcrypt.hashSync("test1234", 4);

function mockUser(overrides: Partial<User> = {}): User {
  return {
    id: "user-1",
    email: "alice@example.com",
    name: "Alice",
    role: "MEMBER",
    passwordHash: TEST_HASH,
    isActive: true,
    teamId: "team-1",
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
    ticketSystemToken: null,
    avatarUrl: null,
    ...overrides,
  };
}

function createMocks() {
  const userRepo: UserRepository = {
    findByEmail: vi.fn(),
    findById: vi.fn(),
    findByIdWithTeam: vi.fn(),
    findByTeamId: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };

  const jwt: JwtFunctions = {
    sign: vi.fn().mockReturnValue("token-xyz"),
    verify: vi.fn().mockReturnValue({ sub: "user-1", role: "MEMBER" }),
  };

  return { userRepo, jwt, service: new AuthService(userRepo, jwt) };
}

describe("AuthService", () => {
  let userRepo: UserRepository;
  let jwt: JwtFunctions;
  let service: AuthService;

  beforeEach(() => {
    vi.clearAllMocks();
    ({ userRepo, jwt, service } = createMocks());
  });

  describe("register", () => {
    it("creates user and returns tokens", async () => {
      vi.mocked(userRepo.findByEmail).mockResolvedValue(null);
      vi.mocked(userRepo.create).mockResolvedValue(mockUser());

      const result = await service.register({
        email: "alice@example.com",
        password: "test1234",
        name: "Alice",
        teamId: "team-1",
      });

      expect(userRepo.findByEmail).toHaveBeenCalledWith("alice@example.com");
      expect(userRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: "alice@example.com",
          name: "Alice",
          teamId: "team-1",
        }),
      );
      expect(result.accessToken).toBe("token-xyz");
      expect(result.refreshToken).toBe("token-xyz");
      expect(result.user).toEqual({
        id: "user-1",
        email: "alice@example.com",
        name: "Alice",
        role: "MEMBER",
      });
    });

    it("throws ConflictError if email already exists", async () => {
      vi.mocked(userRepo.findByEmail).mockResolvedValue(mockUser());

      await expect(
        service.register({
          email: "alice@example.com",
          password: "test1234",
          name: "Alice",
          teamId: "team-1",
        }),
      ).rejects.toThrow(ConflictError);
    });
  });

  describe("login", () => {
    it("returns tokens on valid credentials", async () => {
      vi.mocked(userRepo.findByEmail).mockResolvedValue(mockUser());

      const result = await service.login({
        email: "alice@example.com",
        password: "test1234",
      });

      expect(result.accessToken).toBe("token-xyz");
      expect(result.user.id).toBe("user-1");
    });

    it("throws UnauthorizedError on wrong password", async () => {
      vi.mocked(userRepo.findByEmail).mockResolvedValue(mockUser());

      await expect(
        service.login({ email: "alice@example.com", password: "wrong" }),
      ).rejects.toThrow(UnauthorizedError);
    });

    it("throws UnauthorizedError on nonexistent email", async () => {
      vi.mocked(userRepo.findByEmail).mockResolvedValue(null);

      await expect(
        service.login({ email: "nobody@example.com", password: "test1234" }),
      ).rejects.toThrow(UnauthorizedError);
    });

    it("throws UnauthorizedError when user is inactive", async () => {
      vi.mocked(userRepo.findByEmail).mockResolvedValue(mockUser({ isActive: false }));

      await expect(
        service.login({ email: "alice@example.com", password: "test1234" }),
      ).rejects.toThrow(UnauthorizedError);
    });
  });

  describe("refresh", () => {
    it("returns new tokens on valid refresh token", async () => {
      vi.mocked(userRepo.findById).mockResolvedValue(mockUser());

      const result = await service.refresh("valid-refresh-token");

      expect(jwt.verify).toHaveBeenCalledWith("valid-refresh-token");
      expect(result.accessToken).toBe("token-xyz");
      expect(result.user.id).toBe("user-1");
    });

    it("throws UnauthorizedError on invalid token", async () => {
      vi.mocked(jwt.verify).mockImplementation(() => {
        throw new Error("invalid");
      });

      await expect(service.refresh("bad-token")).rejects.toThrow(UnauthorizedError);
    });

    it("throws UnauthorizedError when user not found", async () => {
      vi.mocked(userRepo.findById).mockResolvedValue(null);

      await expect(service.refresh("valid-token")).rejects.toThrow(UnauthorizedError);
    });

    it("throws UnauthorizedError when user is inactive", async () => {
      vi.mocked(userRepo.findById).mockResolvedValue(mockUser({ isActive: false }));

      await expect(service.refresh("valid-token")).rejects.toThrow(UnauthorizedError);
    });
  });
});
