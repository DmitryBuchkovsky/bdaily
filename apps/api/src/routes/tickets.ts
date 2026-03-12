import type { FastifyInstance } from "fastify";
import { authenticate } from "../middleware/auth.js";
import { ValidationError } from "../middleware/error-handler.js";
import { prisma } from "../lib/prisma.js";
import { createTicketStrategy } from "../services/ticket-system/factory.js";
import type { TicketSystemConfig } from "../services/ticket-system/strategy.js";

interface SearchQuery {
  q?: string;
}

interface TicketParams {
  id?: string;
}

async function getStrategyForUser(userId: string) {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    include: { team: true },
  });

  if (!user.ticketSystemToken) {
    throw new ValidationError(
      "No ticket system token configured. Update your profile to add one.",
    );
  }

  const config: TicketSystemConfig = {
    ...(user.team.ticketSystemConfig as { baseUrl: string; projectIds?: string[] }),
    token: user.ticketSystemToken,
  };

  const strategy = createTicketStrategy(user.team.ticketSystemType);
  await strategy.authenticate(config);
  return strategy;
}

export async function ticketRoutes(app: FastifyInstance) {
  app.addHook("preHandler", authenticate);

  app.get("/assigned", async (request, reply) => {
    const strategy = await getStrategyForUser(request.user.sub);
    const tickets = await strategy.getAssignedTickets(request.user.sub);

    return reply.send({ data: tickets, error: null, meta: null });
  });

  app.get<{ Querystring: SearchQuery }>("/search", async (request, reply) => {
    const { q } = request.query;
    if (!q) {
      throw new ValidationError("Search query parameter 'q' is required");
    }

    const strategy = await getStrategyForUser(request.user.sub);
    const tickets = await strategy.searchTickets(q);

    return reply.send({ data: tickets, error: null, meta: null });
  });

  app.get<{ Params: TicketParams }>("/:id", async (request, reply) => {
    const { id } = request.params;
    if (!id) throw new ValidationError("Ticket id is required");

    const strategy = await getStrategyForUser(request.user.sub);
    const ticket = await strategy.getTicketDetails(id);

    return reply.send({ data: ticket, error: null, meta: null });
  });
}
