import { describe, it, expect, vi, beforeEach } from "vitest";
import bcrypt from "bcryptjs";
import type { User } from "@prisma/client";
import { UserService } from "../services/user.service.js";
import type { UserRepository } from "../repositories/user.repository.js";
import type { EmailService } from "../services/email.service.js";
import { ConflictError, NotFoundError, ValidationError } from "../middleware/error-handler.js";

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

  const emailService = {
    sendTemplated: vi.fn().mockResolvedValue(undefined),
    sendRaw: vi.fn().mockResolvedValue(undefined),
  } as unknown as EmailService;

  return { userRepo, emailService };
}

describe("UserService", () => {
  let userRepo: UserRepository;
  let emailService: EmailService;
  let service: UserService;

  beforeEach(() => {
    vi.clearAllMocks();
    ({ userRepo, emailService } = createMocks());
    service = new UserService(userRepo, emailService);
  });

  describe("getTeamMembers", () => {
    it("delegates to userRepo.findByTeamId", async () => {
      const members = [mockUser()];
      vi.mocked(userRepo.findByTeamId).mockResolvedValue(members);

      const result = await service.getTeamMembers("team-1");

      expect(userRepo.findByTeamId).toHaveBeenCalledWith("team-1");
      expect(result).toEqual(members);
    });
  });

  describe("addMember", () => {
    it("creates user with hashed password", async () => {
      vi.mocked(userRepo.findByEmail).mockResolvedValue(null);
      vi.mocked(userRepo.create).mockResolvedValue(mockUser());

      const result = await service.addMember({
        email: "alice@example.com",
        name: "Alice",
        password: "test1234",
        teamId: "team-1",
      });

      expect(userRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: "alice@example.com",
          name: "Alice",
          teamId: "team-1",
          passwordHash: expect.any(String),
        }),
      );
      expect(result.id).toBe("user-1");
    });

    it("throws ConflictError if email exists", async () => {
      vi.mocked(userRepo.findByEmail).mockResolvedValue(mockUser());

      await expect(
        service.addMember({
          email: "alice@example.com",
          name: "Alice",
          password: "test1234",
          teamId: "team-1",
        }),
      ).rejects.toThrow(ConflictError);
    });

    it("sends invite email via emailService", async () => {
      vi.mocked(userRepo.findByEmail).mockResolvedValue(null);
      vi.mocked(userRepo.create).mockResolvedValue(mockUser());

      await service.addMember({
        email: "alice@example.com",
        name: "Alice",
        password: "test1234",
        teamId: "team-1",
      });

      expect(emailService.sendTemplated).toHaveBeenCalledWith(
        "alice@example.com",
        "invite",
        expect.objectContaining({ name: "Alice", email: "alice@example.com" }),
      );
    });
  });

  describe("updateMember", () => {
    it("updates user", async () => {
      const updated = mockUser({ name: "Alice Updated" });
      vi.mocked(userRepo.findById).mockResolvedValue(mockUser());
      vi.mocked(userRepo.update).mockResolvedValue(updated);

      const result = await service.updateMember("user-1", {
        name: "Alice Updated",
      });

      expect(userRepo.update).toHaveBeenCalledWith("user-1", {
        name: "Alice Updated",
      });
      expect(result.name).toBe("Alice Updated");
    });

    it("throws NotFoundError if user not found", async () => {
      vi.mocked(userRepo.findById).mockResolvedValue(null);

      await expect(service.updateMember("missing", { name: "X" })).rejects.toThrow(NotFoundError);
    });
  });

  describe("setActive", () => {
    it("sets isActive field", async () => {
      vi.mocked(userRepo.findById).mockResolvedValue(mockUser());
      vi.mocked(userRepo.update).mockResolvedValue(mockUser({ isActive: false }));

      const result = await service.setActive("user-1", false);

      expect(userRepo.update).toHaveBeenCalledWith("user-1", {
        isActive: false,
      });
      expect(result.isActive).toBe(false);
    });

    it("throws NotFoundError if user not found", async () => {
      vi.mocked(userRepo.findById).mockResolvedValue(null);

      await expect(service.setActive("missing", true)).rejects.toThrow(NotFoundError);
    });
  });

  describe("removeMember", () => {
    it("deletes user", async () => {
      vi.mocked(userRepo.findById).mockResolvedValue(mockUser());
      vi.mocked(userRepo.delete).mockResolvedValue(undefined);

      await service.removeMember("user-1");

      expect(userRepo.delete).toHaveBeenCalledWith("user-1");
    });

    it("throws NotFoundError if user not found", async () => {
      vi.mocked(userRepo.findById).mockResolvedValue(null);

      await expect(service.removeMember("missing")).rejects.toThrow(NotFoundError);
    });
  });

  describe("getProfile", () => {
    it("returns user", async () => {
      vi.mocked(userRepo.findById).mockResolvedValue(mockUser());

      const result = await service.getProfile("user-1");

      expect(result.id).toBe("user-1");
    });

    it("throws NotFoundError if not found", async () => {
      vi.mocked(userRepo.findById).mockResolvedValue(null);

      await expect(service.getProfile("missing")).rejects.toThrow(NotFoundError);
    });
  });

  describe("updateProfile", () => {
    it("updates and returns user", async () => {
      vi.mocked(userRepo.findById).mockResolvedValue(mockUser());
      vi.mocked(userRepo.update).mockResolvedValue(mockUser({ name: "Alice New" }));

      const result = await service.updateProfile("user-1", {
        name: "Alice New",
      });

      expect(userRepo.update).toHaveBeenCalledWith("user-1", {
        name: "Alice New",
      });
      expect(result.name).toBe("Alice New");
    });

    it("throws NotFoundError if not found", async () => {
      vi.mocked(userRepo.findById).mockResolvedValue(null);

      await expect(service.updateProfile("missing", { name: "X" })).rejects.toThrow(NotFoundError);
    });
  });

  describe("changePassword", () => {
    it("updates password hash", async () => {
      vi.mocked(userRepo.findById).mockResolvedValue(mockUser());
      vi.mocked(userRepo.update).mockResolvedValue(mockUser());

      await service.changePassword("user-1", "test1234", "newpass99");

      expect(userRepo.update).toHaveBeenCalledWith(
        "user-1",
        expect.objectContaining({ passwordHash: expect.any(String) }),
      );
      const call = vi.mocked(userRepo.update).mock.calls[0]!;
      const newHash = (call[1] as { passwordHash: string }).passwordHash;
      expect(bcrypt.compareSync("newpass99", newHash)).toBe(true);
    });

    it("throws NotFoundError if user not found", async () => {
      vi.mocked(userRepo.findById).mockResolvedValue(null);

      await expect(service.changePassword("missing", "test1234", "newpass99")).rejects.toThrow(
        NotFoundError,
      );
    });

    it("throws ValidationError if current password is wrong", async () => {
      vi.mocked(userRepo.findById).mockResolvedValue(mockUser());

      await expect(service.changePassword("user-1", "wrongpass", "newpass99")).rejects.toThrow(
        ValidationError,
      );
    });
  });
});
