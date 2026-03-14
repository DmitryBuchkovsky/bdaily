import type { InputJsonValue } from "@prisma/client/runtime/library";
import type { TeamRepository, TeamWithMemberCount } from "../repositories/team.repository.js";
import { NotFoundError } from "../middleware/error-handler.js";
import { removeFile } from "../lib/uploads.js";

interface CreateTeamInput {
  name: string;
  ticketSystemType: "YOUTRACK" | "JIRA" | "LINEAR";
  ticketSystemConfig: InputJsonValue;
}

interface UpdateTeamInput {
  name?: string;
  ticketSystemType?: "YOUTRACK" | "JIRA" | "LINEAR";
  ticketSystemConfig?: InputJsonValue;
}

interface UpdateThemeInput {
  themeConfig?: InputJsonValue;
  logoPath?: string | null;
  faviconPath?: string | null;
}

export class TeamService {
  constructor(private readonly teamRepo: TeamRepository) {}

  async getAll(): Promise<TeamWithMemberCount[]> {
    return this.teamRepo.findAll();
  }

  async getById(id: string): Promise<TeamWithMemberCount> {
    const team = await this.teamRepo.findById(id);
    if (!team) throw new NotFoundError("Team not found");
    return team;
  }

  async create(input: CreateTeamInput): Promise<TeamWithMemberCount> {
    const team = await this.teamRepo.create(input);
    const withCount = await this.teamRepo.findById(team.id);
    return withCount!;
  }

  async update(id: string, input: UpdateTeamInput): Promise<TeamWithMemberCount> {
    const team = await this.getById(id);

    if (input.ticketSystemConfig) {
      const incoming = input.ticketSystemConfig as Record<string, unknown>;
      if (!incoming.token) {
        const existing = team.ticketSystemConfig as Record<string, unknown> | null;
        if (existing?.token) {
          incoming.token = existing.token;
        }
      }
    }

    await this.teamRepo.update(id, input);
    return (await this.teamRepo.findById(id))!;
  }

  async updateTheme(id: string, input: UpdateThemeInput): Promise<TeamWithMemberCount> {
    const team = await this.getById(id);

    if (input.logoPath !== undefined && team.logoPath && input.logoPath !== team.logoPath) {
      await removeFile(team.logoPath);
    }
    if (
      input.faviconPath !== undefined &&
      team.faviconPath &&
      input.faviconPath !== team.faviconPath
    ) {
      await removeFile(team.faviconPath);
    }

    await this.teamRepo.update(id, input);
    return (await this.teamRepo.findById(id))!;
  }

  async delete(id: string): Promise<void> {
    const team = await this.getById(id);
    if (team.logoPath) await removeFile(team.logoPath);
    if (team.faviconPath) await removeFile(team.faviconPath);
    await this.teamRepo.delete(id);
  }
}
