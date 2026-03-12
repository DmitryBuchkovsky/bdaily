import { z } from "zod";

export const UserRole = z.enum(["ADMIN", "MEMBER"]);
export type UserRole = z.infer<typeof UserRole>;

export const TicketSystemType = z.enum(["YOUTRACK", "JIRA", "LINEAR"]);
export type TicketSystemType = z.infer<typeof TicketSystemType>;

export const CompletedItemType = z.enum(["TASK", "BUG_FIX"]);
export type CompletedItemType = z.infer<typeof CompletedItemType>;

export const CompletedItemStatus = z.enum(["COMPLETED", "MERGED", "DEPLOYED"]);
export type CompletedItemStatus = z.infer<typeof CompletedItemStatus>;

export const TodayItemPriority = z.enum(["PRIMARY", "SECONDARY"]);
export type TodayItemPriority = z.infer<typeof TodayItemPriority>;

export const BlockerType = z.enum(["TECHNICAL", "DEPENDENCY"]);
export type BlockerType = z.infer<typeof BlockerType>;

export const QuestionType = z.enum(["TECHNICAL", "PRODUCT", "PROCESS"]);
export type QuestionType = z.infer<typeof QuestionType>;

export const TestResult = z.enum(["APPROVED", "REJECTED"]);
export type TestResult = z.infer<typeof TestResult>;
