import type { FastifyInstance } from "fastify";
import type { UserRepository } from "../repositories/user.repository.js";
import type { TicketSystemConfig } from "../services/ticket-system/strategy.js";
import { authenticate } from "../middleware/auth.js";
import { NotFoundError, ValidationError } from "../middleware/error-handler.js";
import { createTicketStrategy } from "../services/ticket-system/factory.js";

interface SearchQuery {
  q?: string;
}

interface TicketParams {
  id?: string;
}

interface StoredConfig {
  baseUrl: string;
  projectIds?: string[];
  token?: string;
}

function buildTicketConfig(user: { team: { ticketSystemConfig: unknown } }): TicketSystemConfig {
  const stored = user.team.ticketSystemConfig as StoredConfig;
  if (!stored.token) {
    throw new ValidationError(
      "No ticket system API token configured. Ask your admin to set one in Team Settings.",
    );
  }
  return { ...stored, token: stored.token };
}

export function ticketRoutes(userRepo: UserRepository): (app: FastifyInstance) => Promise<void> {
  return async (app: FastifyInstance): Promise<void> => {
    app.addHook("preHandler", authenticate);

    app.get("/assigned", async (request, reply) => {
      const user = await userRepo.findByIdWithTeam(request.user.sub);
      if (!user) throw new NotFoundError("User not found");

      const config = buildTicketConfig(user);
      const strategy = createTicketStrategy(user.team.ticketSystemType);
      await strategy.authenticate(config);
      const tickets = await strategy.getAssignedTickets(request.user.sub);

      return reply.send({ data: tickets, error: null, meta: null });
    });

    app.get<{ Querystring: SearchQuery }>("/search", async (request, reply) => {
      const { q } = request.query;
      if (!q) {
        throw new ValidationError("Search query parameter 'q' is required");
      }

      const user = await userRepo.findByIdWithTeam(request.user.sub);
      if (!user) throw new NotFoundError("User not found");

      const config = buildTicketConfig(user);
      const strategy = createTicketStrategy(user.team.ticketSystemType);
      await strategy.authenticate(config);
      const tickets = await strategy.searchTickets(q);

      return reply.send({ data: tickets, error: null, meta: null });
    });

    app.get<{ Params: TicketParams }>("/:id", async (request, reply) => {
      const { id } = request.params;
      if (!id) throw new ValidationError("Ticket id is required");

      const user = await userRepo.findByIdWithTeam(request.user.sub);
      if (!user) throw new NotFoundError("User not found");

      const config = buildTicketConfig(user);
      const strategy = createTicketStrategy(user.team.ticketSystemType);
      await strategy.authenticate(config);
      const ticket = await strategy.getTicketDetails(id);

      return reply.send({ data: ticket, error: null, meta: null });
    });
  };
}
