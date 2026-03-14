import { describe, it, expect, vi, beforeEach } from "vitest";
import { TeamService } from "../services/team.service.js";
import type { TeamRepository, TeamWithMemberCount } from "../repositories/team.repository.js";
import { NotFoundError } from "../middleware/error-handler.js";

vi.mock("../lib/uploads.js", () => ({
  removeFile: vi.fn().mockResolvedValue(undefined),
}));

import { removeFile } from "../lib/uploads.js";

function mockTeam(overrides: Record<string, unknown> = {}): TeamWithMemberCount {
  return {
    id: "team-1",
    name: "Engineering",
    ticketSystemType: "YOUTRACK",
    ticketSystemConfig: { baseUrl: "https://yt.example.com", token: "secret" },
    themeConfig: null,
    logoPath: null,
    faviconPath: null,
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
    _count: { users: 3 },
    ...overrides,
  } as TeamWithMemberCount;
}

function createMocks() {
  const teamRepo: TeamRepository = {
    findAll: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };

  return { teamRepo, service: new TeamService(teamRepo) };
}

describe("TeamService", () => {
  let teamRepo: TeamRepository;
  let service: TeamService;

  beforeEach(() => {
    vi.clearAllMocks();
    ({ teamRepo, service } = createMocks());
  });

  describe("getAll", () => {
    it("delegates to teamRepo.findAll", async () => {
      const teams = [mockTeam()];
      vi.mocked(teamRepo.findAll).mockResolvedValue(teams);

      const result = await service.getAll();

      expect(teamRepo.findAll).toHaveBeenCalled();
      expect(result).toEqual(teams);
    });
  });

  describe("getById", () => {
    it("returns team", async () => {
      vi.mocked(teamRepo.findById).mockResolvedValue(mockTeam());

      const result = await service.getById("team-1");

      expect(result.id).toBe("team-1");
    });

    it("throws NotFoundError if not found", async () => {
      vi.mocked(teamRepo.findById).mockResolvedValue(null);

      await expect(service.getById("missing")).rejects.toThrow(NotFoundError);
    });
  });

  describe("create", () => {
    it("creates team and fetches with count", async () => {
      const raw = { id: "team-2", name: "Design" } as never;
      vi.mocked(teamRepo.create).mockResolvedValue(raw);
      vi.mocked(teamRepo.findById).mockResolvedValue(mockTeam({ id: "team-2", name: "Design" }));

      const result = await service.create({
        name: "Design",
        ticketSystemType: "YOUTRACK",
        ticketSystemConfig: { baseUrl: "https://yt.example.com" },
      });

      expect(teamRepo.create).toHaveBeenCalled();
      expect(teamRepo.findById).toHaveBeenCalledWith("team-2");
      expect(result.name).toBe("Design");
    });
  });

  describe("update", () => {
    it("preserves existing token when incoming has no token", async () => {
      vi.mocked(teamRepo.findById).mockResolvedValue(mockTeam());
      vi.mocked(teamRepo.update).mockResolvedValue({} as never);

      await service.update("team-1", {
        ticketSystemConfig: { baseUrl: "https://new.example.com" },
      });

      expect(teamRepo.update).toHaveBeenCalledWith(
        "team-1",
        expect.objectContaining({
          ticketSystemConfig: {
            baseUrl: "https://new.example.com",
            token: "secret",
          },
        }),
      );
    });

    it("uses new token when provided", async () => {
      vi.mocked(teamRepo.findById).mockResolvedValue(mockTeam());
      vi.mocked(teamRepo.update).mockResolvedValue({} as never);

      await service.update("team-1", {
        ticketSystemConfig: {
          baseUrl: "https://new.example.com",
          token: "new-token",
        },
      });

      expect(teamRepo.update).toHaveBeenCalledWith(
        "team-1",
        expect.objectContaining({
          ticketSystemConfig: {
            baseUrl: "https://new.example.com",
            token: "new-token",
          },
        }),
      );
    });
  });

  describe("delete", () => {
    it("removes logo and favicon files then deletes team", async () => {
      vi.mocked(teamRepo.findById).mockResolvedValue(
        mockTeam({ logoPath: "/uploads/logo.png", faviconPath: "/uploads/fav.png" }),
      );
      vi.mocked(teamRepo.delete).mockResolvedValue(undefined);

      await service.delete("team-1");

      expect(removeFile).toHaveBeenCalledWith("/uploads/logo.png");
      expect(removeFile).toHaveBeenCalledWith("/uploads/fav.png");
      expect(teamRepo.delete).toHaveBeenCalledWith("team-1");
    });

    it("skips file removal when paths are null", async () => {
      vi.mocked(teamRepo.findById).mockResolvedValue(mockTeam());
      vi.mocked(teamRepo.delete).mockResolvedValue(undefined);

      await service.delete("team-1");

      expect(removeFile).not.toHaveBeenCalled();
      expect(teamRepo.delete).toHaveBeenCalledWith("team-1");
    });

    it("throws NotFoundError if team not found", async () => {
      vi.mocked(teamRepo.findById).mockResolvedValue(null);

      await expect(service.delete("missing")).rejects.toThrow(NotFoundError);
    });
  });
});
