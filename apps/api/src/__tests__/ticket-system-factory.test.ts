import { describe, it, expect } from "vitest";
import { createTicketStrategy } from "../services/ticket-system/factory.js";

describe("createTicketStrategy", () => {
  it("creates a YouTrack strategy", () => {
    const strategy = createTicketStrategy("YOUTRACK");
    expect(strategy).toBeDefined();
    expect(strategy.name).toBe("YouTrack");
  });

  it("throws for unsupported ticket system type", () => {
    expect(() => createTicketStrategy("UNKNOWN")).toThrow(
      /Unsupported ticket system type: UNKNOWN/,
    );
  });

  it("throws for JIRA (not yet implemented)", () => {
    expect(() => createTicketStrategy("JIRA")).toThrow(
      /Unsupported ticket system type: JIRA/,
    );
  });

  it("throws for LINEAR (not yet implemented)", () => {
    expect(() => createTicketStrategy("LINEAR")).toThrow(
      /Unsupported ticket system type: LINEAR/,
    );
  });

  it("includes supported types in error message", () => {
    try {
      createTicketStrategy("NOPE");
    } catch (e) {
      expect((e as Error).message).toContain("Supported: YOUTRACK");
    }
  });
});
