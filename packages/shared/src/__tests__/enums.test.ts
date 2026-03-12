import { describe, it, expect } from "vitest";
import {
  UserRole,
  TicketSystemType,
  CompletedItemType,
  CompletedItemStatus,
  TodayItemPriority,
  BlockerType,
  QuestionType,
  TestResult,
  loginSchema,
  registerSchema,
  createDailyReportSchema,
} from "../index.js";

describe("enums", () => {
  it("UserRole has expected values", () => {
    expect(UserRole.options).toEqual(["ADMIN", "MEMBER"]);
  });

  it("TicketSystemType has expected values", () => {
    expect(TicketSystemType.options).toEqual(["YOUTRACK", "JIRA", "LINEAR"]);
  });

  it("CompletedItemType has expected values", () => {
    expect(CompletedItemType.options).toEqual(["TASK", "BUG_FIX"]);
  });

  it("CompletedItemStatus has expected values", () => {
    expect(CompletedItemStatus.options).toEqual(["COMPLETED", "MERGED", "DEPLOYED"]);
  });

  it("TodayItemPriority has expected values", () => {
    expect(TodayItemPriority.options).toEqual(["PRIMARY", "SECONDARY"]);
  });

  it("BlockerType has expected values", () => {
    expect(BlockerType.options).toEqual(["TECHNICAL", "DEPENDENCY"]);
  });

  it("QuestionType has expected values", () => {
    expect(QuestionType.options).toEqual(["TECHNICAL", "PRODUCT", "PROCESS"]);
  });

  it("TestResult has expected values", () => {
    expect(TestResult.options).toEqual(["APPROVED", "REJECTED"]);
  });
});

describe("loginSchema", () => {
  it("accepts valid login input", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "secret123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = loginSchema.safeParse({
      email: "not-an-email",
      password: "secret123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects short password", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "abc",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing fields", () => {
    const result = loginSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("registerSchema", () => {
  it("accepts valid registration input", () => {
    const result = registerSchema.safeParse({
      email: "user@example.com",
      password: "secret123",
      name: "Test User",
      teamId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing name", () => {
    const result = registerSchema.safeParse({
      email: "user@example.com",
      password: "secret123",
      teamId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty name", () => {
    const result = registerSchema.safeParse({
      email: "user@example.com",
      password: "secret123",
      name: "",
      teamId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const result = registerSchema.safeParse({
      email: "bad",
      password: "secret123",
      name: "Test User",
      teamId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing teamId", () => {
    const result = registerSchema.safeParse({
      email: "user@example.com",
      password: "secret123",
      name: "Test User",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid teamId format", () => {
    const result = registerSchema.safeParse({
      email: "user@example.com",
      password: "secret123",
      name: "Test User",
      teamId: "not-a-uuid",
    });
    expect(result.success).toBe(false);
  });
});

describe("createDailyReportSchema", () => {
  it("accepts valid report with all sections", () => {
    const result = createDailyReportSchema.safeParse({
      date: "2026-03-12",
      completedItems: [
        {
          ticketId: "PROJ-1",
          title: "Fix login bug",
          type: "BUG_FIX",
          status: "MERGED",
        },
      ],
      todayItems: [
        {
          ticketId: "PROJ-2",
          title: "Build dashboard",
          priority: "PRIMARY",
        },
      ],
      blockers: [
        {
          type: "TECHNICAL",
          description: "CI pipeline is broken",
        },
      ],
      notes: {
        deploymentNotes: "Sprint ends Friday",
      },
      questions: [
        {
          type: "PRODUCT",
          content: "Should we support dark mode?",
        },
      ],
      testedTickets: [
        {
          ticketId: "PROJ-3",
          title: "Test search feature",
          result: "APPROVED",
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("accepts report with only date (all arrays default to empty)", () => {
    const result = createDailyReportSchema.safeParse({
      date: "2026-03-12",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.completedItems).toEqual([]);
      expect(result.data.todayItems).toEqual([]);
      expect(result.data.blockers).toEqual([]);
      expect(result.data.notes).toBeUndefined();
      expect(result.data.questions).toEqual([]);
      expect(result.data.testedTickets).toEqual([]);
    }
  });

  it("accepts completed item without ticketId (optional)", () => {
    const result = createDailyReportSchema.safeParse({
      date: "2026-03-12",
      completedItems: [
        {
          title: "Fix login bug",
          type: "BUG_FIX",
          status: "MERGED",
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid enum values", () => {
    const result = createDailyReportSchema.safeParse({
      date: "2026-03-12",
      completedItems: [
        {
          ticketId: "PROJ-1",
          title: "Fix login bug",
          type: "INVALID_TYPE",
          status: "MERGED",
        },
      ],
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing date", () => {
    const result = createDailyReportSchema.safeParse({
      completedItems: [],
    });
    expect(result.success).toBe(false);
  });

  it("rejects extra keys on strict schemas", () => {
    const result = createDailyReportSchema.safeParse({
      date: "2026-03-12",
      extraField: "should fail",
    });
    expect(result.success).toBe(false);
  });
});
