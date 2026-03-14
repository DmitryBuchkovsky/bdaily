export type ActionItemStatus = "PENDING" | "IN_PROGRESS" | "PENDING_APPROVAL" | "DONE" | "REJECTED";

export interface ActionItemUser {
  id: string;
  name?: string;
  [key: string]: unknown;
}

export interface ActionItem {
  id: string;
  title: string;
  description?: string | null;
  dueDate: string | null;
  status: ActionItemStatus;
  assignedBy: ActionItemUser;
  assignee: ActionItemUser;
  [key: string]: unknown;
}

export const STATUS_STYLES: Record<ActionItemStatus, string> = {
  PENDING: "bg-muted text-muted-foreground",
  IN_PROGRESS: "bg-primary/10 text-primary",
  PENDING_APPROVAL: "bg-amber-500/10 text-amber-600",
  DONE: "bg-success/10 text-success",
  REJECTED: "bg-destructive/10 text-destructive",
};
