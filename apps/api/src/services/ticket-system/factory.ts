import type { TicketSystemStrategy } from "./strategy.js";
import { YouTrackStrategy } from "./youtrack.js";

const strategies: Record<string, () => TicketSystemStrategy> = {
  YOUTRACK: () => new YouTrackStrategy(),
};

export function createTicketStrategy(type: string): TicketSystemStrategy {
  const factory = strategies[type];
  if (!factory) {
    throw new Error(
      `Unsupported ticket system type: ${type}. Supported: ${Object.keys(strategies).join(", ")}`,
    );
  }
  return factory();
}
