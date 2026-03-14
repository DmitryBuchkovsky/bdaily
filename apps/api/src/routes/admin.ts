import type { FastifyInstance, FastifyRequest } from "fastify";
import type { InputJsonValue } from "@prisma/client/runtime/library";
import { z } from "zod";
import {
  createTeamSchema,
  updateTeamSchema,
  addMemberSchema,
  updateMemberSchema,
} from "@bdaily/shared";
import { authenticate, requireAdmin } from "../middleware/auth.js";
import type { TeamService } from "../services/team.service.js";
import type { UserService } from "../services/user.service.js";
import type { TeamWithMemberCount } from "../repositories/team.repository.js";
import type { EmailTemplateRepository } from "../repositories/email-template.repository.js";
import { saveUploadedFile, removeFile } from "../lib/uploads.js";

type TeamAny = TeamWithMemberCount & Record<string, unknown>;

function serializeTeam(t: TeamWithMemberCount) {
  const ta = t as unknown as TeamAny;
  const rawConfig = ta.ticketSystemConfig as Record<string, unknown> | null;
  const safeConfig = rawConfig
    ? { ...rawConfig, token: rawConfig.token ? "••••••••" : undefined }
    : rawConfig;

  return {
    id: ta.id,
    name: ta.name,
    ticketSystemType: ta.ticketSystemType,
    ticketSystemConfig: safeConfig,
    themeConfig: ta.themeConfig ?? null,
    logoPath: ta.logoPath ?? null,
    faviconPath: ta.faviconPath ?? null,
    memberCount: ta._count.users,
    createdAt: ta.createdAt.toISOString(),
    updatedAt: ta.updatedAt.toISOString(),
  };
}

const updateTemplateSchema = z
  .object({
    name: z.string().min(1).max(100).optional(),
    subject: z.string().min(1).max(200),
    bodyHtml: z.string().min(1),
    description: z.string().max(500).optional(),
  })
  .strict();

export function adminRoutes(
  teamService: TeamService,
  userService: UserService,
  emailTemplateRepo: EmailTemplateRepository,
) {
  return async function (app: FastifyInstance): Promise<void> {
    app.addHook("preHandler", authenticate);
    app.addHook("preHandler", requireAdmin);

    app.get("/teams", async () => {
      const teams = await teamService.getAll();
      return { data: teams.map(serializeTeam) };
    });

    app.post("/teams", async (request) => {
      const input = createTeamSchema.parse(request.body);
      const team = await teamService.create(input);
      return { data: serializeTeam(team) };
    });

    app.get<{ Params: { id: string } }>("/teams/:id", async (request) => {
      const team = await teamService.getById(request.params.id);
      const members = await userService.getTeamMembers(request.params.id);
      return {
        data: {
          ...serializeTeam(team),
          members: members.map((m) => ({
            id: m.id,
            email: m.email,
            name: m.name,
            role: m.role,
            isActive: m.isActive,
            createdAt: m.createdAt.toISOString(),
          })),
        },
      };
    });

    app.put<{ Params: { id: string } }>("/teams/:id", async (request) => {
      const input = updateTeamSchema.parse(request.body);
      const team = await teamService.update(request.params.id, input);
      return { data: serializeTeam(team) };
    });

    app.delete<{ Params: { id: string } }>("/teams/:id", async (request, reply) => {
      await teamService.delete(request.params.id);
      return reply.status(204).send();
    });

    // ── Theme configuration ────────────────────────────────────────────

    app.put<{ Params: { id: string } }>("/teams/:id/theme", async (request) => {
      const body = request.body as Record<string, unknown> | null;
      const themeConfig = body?.themeConfig as InputJsonValue | undefined;
      const team = await teamService.updateTheme(request.params.id, {
        themeConfig: themeConfig ?? undefined,
      });
      return { data: serializeTeam(team) };
    });

    app.post<{ Params: { id: string } }>(
      "/teams/:id/logo",
      async (request: FastifyRequest<{ Params: { id: string } }>) => {
        const file = await request.file();
        if (!file) {
          return { error: "No file uploaded" };
        }
        const { relativePath } = await saveUploadedFile(file);
        const team = await teamService.updateTheme(request.params.id, {
          logoPath: relativePath,
        });
        return { data: { logoPath: (team as unknown as TeamAny).logoPath ?? null } };
      },
    );

    app.delete<{ Params: { id: string } }>("/teams/:id/logo", async (request) => {
      const team = await teamService.getById(request.params.id);
      const logoPath = (team as unknown as TeamAny).logoPath as string | null;
      if (logoPath) await removeFile(logoPath);
      await teamService.updateTheme(request.params.id, { logoPath: null });
      return { data: { logoPath: null } };
    });

    app.post<{ Params: { id: string } }>(
      "/teams/:id/favicon",
      async (request: FastifyRequest<{ Params: { id: string } }>) => {
        const file = await request.file();
        if (!file) {
          return { error: "No file uploaded" };
        }
        const { relativePath } = await saveUploadedFile(file);
        const team = await teamService.updateTheme(request.params.id, {
          faviconPath: relativePath,
        });
        return { data: { faviconPath: (team as unknown as TeamAny).faviconPath ?? null } };
      },
    );

    app.delete<{ Params: { id: string } }>("/teams/:id/favicon", async (request) => {
      const team = await teamService.getById(request.params.id);
      const faviconPath = (team as unknown as TeamAny).faviconPath as string | null;
      if (faviconPath) await removeFile(faviconPath);
      await teamService.updateTheme(request.params.id, {
        faviconPath: null,
      });
      return { data: { faviconPath: null } };
    });

    // ── Members ────────────────────────────────────────────────────────

    app.get<{ Params: { id: string } }>("/teams/:id/members", async (request) => {
      const members = await userService.getTeamMembers(request.params.id);
      return {
        data: members.map((m) => ({
          id: m.id,
          email: m.email,
          name: m.name,
          role: m.role,
          isActive: m.isActive,
          createdAt: m.createdAt.toISOString(),
        })),
      };
    });

    app.post<{ Params: { id: string } }>("/teams/:id/members", async (request, reply) => {
      const input = addMemberSchema.parse(request.body);
      const member = await userService.addMember({
        ...input,
        teamId: request.params.id,
      });
      return reply.status(201).send({
        data: {
          id: member.id,
          email: member.email,
          name: member.name,
          role: member.role,
          isActive: member.isActive,
          createdAt: member.createdAt.toISOString(),
        },
      });
    });

    app.put<{ Params: { id: string } }>("/members/:id", async (request) => {
      const input = updateMemberSchema.parse(request.body);
      const member = await userService.updateMember(request.params.id, input);
      return {
        data: {
          id: member.id,
          email: member.email,
          name: member.name,
          role: member.role,
          isActive: member.isActive,
        },
      };
    });

    app.put<{ Params: { id: string } }>("/members/:id/activate", async (request) => {
      const member = await userService.setActive(request.params.id, true);
      return {
        data: {
          id: member.id,
          email: member.email,
          name: member.name,
          role: member.role,
          isActive: member.isActive,
        },
      };
    });

    app.put<{ Params: { id: string } }>("/members/:id/deactivate", async (request) => {
      const member = await userService.setActive(request.params.id, false);
      return {
        data: {
          id: member.id,
          email: member.email,
          name: member.name,
          role: member.role,
          isActive: member.isActive,
        },
      };
    });

    app.delete<{ Params: { id: string } }>("/members/:id", async (request, reply) => {
      await userService.removeMember(request.params.id);
      return reply.status(204).send();
    });

    // ── Email templates ─────────────────────────────────────────────────

    app.get("/email-templates", async () => {
      const templates = await emailTemplateRepo.findAll();
      return {
        data: templates.map((t) => ({
          id: t.id,
          slug: t.slug,
          name: t.name,
          subject: t.subject,
          bodyHtml: t.bodyHtml,
          description: t.description,
          variables: t.variables,
          updatedAt: t.updatedAt.toISOString(),
        })),
      };
    });

    app.put<{ Params: { id: string } }>("/email-templates/:id", async (request) => {
      const input = updateTemplateSchema.parse(request.body);
      const template = await emailTemplateRepo.update(request.params.id, input);
      return {
        data: {
          id: template.id,
          slug: template.slug,
          name: template.name,
          subject: template.subject,
          bodyHtml: template.bodyHtml,
          description: template.description,
          variables: template.variables,
          updatedAt: template.updatedAt.toISOString(),
        },
      };
    });
  };
}
