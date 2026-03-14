import type { PrismaClient, Team } from "@prisma/client";
import type { InputJsonValue } from "@prisma/client/runtime/library";

interface CreateTeamData {
  name: string;
  ticketSystemType: "YOUTRACK" | "JIRA" | "LINEAR";
  ticketSystemConfig: InputJsonValue;
}

interface UpdateTeamData {
  name?: string;
  ticketSystemType?: "YOUTRACK" | "JIRA" | "LINEAR";
  ticketSystemConfig?: InputJsonValue;
  themeConfig?: InputJsonValue;
  logoPath?: string | null;
  faviconPath?: string | null;
}

export interface TeamWithMemberCount extends Team {
  _count: { users: number };
}

export interface TeamRepository {
  findById(id: string): Promise<TeamWithMemberCount | null>;
  findAll(): Promise<TeamWithMemberCount[]>;
  create(data: CreateTeamData): Promise<Team>;
  update(id: string, data: UpdateTeamData): Promise<Team>;
  delete(id: string): Promise<void>;
}

export class PrismaTeamRepository implements TeamRepository {
  constructor(private readonly db: PrismaClient) {}

  async findById(id: string): Promise<TeamWithMemberCount | null> {
    return this.db.team.findUnique({
      where: { id },
      include: { _count: { select: { users: true } } },
    });
  }

  async findAll(): Promise<TeamWithMemberCount[]> {
    return this.db.team.findMany({
      include: { _count: { select: { users: true } } },
      orderBy: { name: "asc" },
    });
  }

  async create(data: CreateTeamData): Promise<Team> {
    return this.db.team.create({ data });
  }

  async update(id: string, data: UpdateTeamData): Promise<Team> {
    return this.db.team.update({ where: { id }, data });
  }

  async delete(id: string): Promise<void> {
    await this.db.team.delete({ where: { id } });
  }
}
