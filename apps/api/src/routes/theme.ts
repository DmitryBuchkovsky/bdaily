import type { FastifyInstance } from "fastify";
import { authenticate } from "../middleware/auth.js";
import type { TeamService } from "../services/team.service.js";
import type { UserRepository } from "../repositories/user.repository.js";

export function themeRoutes(teamService: TeamService, userRepo: UserRepository) {
  return async function (app: FastifyInstance): Promise<void> {
    app.get("/my-team", async (request) => {
      await authenticate(request, {} as never);
      const user = await userRepo.findById(request.user.sub);
      if (!user?.teamId) return { data: null };

      const team = await teamService.getById(user.teamId);
      return {
        data: {
          themeConfig: team.themeConfig,
          logoPath: team.logoPath,
          faviconPath: team.faviconPath,
          companyName: team.name,
        },
      };
    });
  };
}
