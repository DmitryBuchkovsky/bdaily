import { format, isPast } from "date-fns";
import { Play, CheckCircle2, ThumbsUp, ThumbsDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ActionItem } from "./actionItemTypes";
import { STATUS_STYLES } from "./actionItemTypes";

interface ActionItemCardProps {
  item: ActionItem;
  currentUserId: string;
  onStart?: (id: string) => void;
  onRequestDone: (id: string) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export function ActionItemCard({
  item,
  currentUserId,
  onStart,
  onRequestDone,
  onApprove,
  onReject,
}: ActionItemCardProps) {
  const isAssignee = currentUserId === item.assignee?.id;
  const isAssigner = currentUserId === item.assignedBy?.id;
  const needsApproval = item.status === "PENDING_APPROVAL" && isAssigner;
  const overdue = item.dueDate && isPast(new Date(item.dueDate)) && item.status !== "DONE";
  const desc = item.description
    ? String(item.description).slice(0, 100) + (String(item.description).length > 100 ? "…" : "")
    : null;

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="min-w-0 flex-1">
        <h3 className="font-medium">{item.title}</h3>
        {desc && <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{desc}</p>}
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span
            className={cn("rounded-md px-2 py-0.5 text-xs font-medium", STATUS_STYLES[item.status])}
          >
            {item.status.replace(/_/g, " ")}
          </span>
          {item.dueDate && (
            <span
              className={cn(
                "text-xs",
                overdue ? "font-medium text-destructive" : "text-muted-foreground",
              )}
            >
              Due {format(new Date(item.dueDate), "MMM d, yyyy")}
              {overdue && " (overdue)"}
            </span>
          )}
        </div>
      </div>
      {item.status === "PENDING_APPROVAL" && (
        <div className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-sm">
          <p className="font-medium text-amber-700">Pending your approval</p>
          <p className="text-xs text-muted-foreground">
            Assigned to {item.assignee?.name ?? "Unknown"}
          </p>
        </div>
      )}
      <div className="mt-3 flex flex-wrap gap-2">
        {isAssignee && item.status === "PENDING" && onStart && (
          <ActionBtn icon={Play} onClick={() => onStart(item.id)}>
            Start
          </ActionBtn>
        )}
        {isAssignee && item.status === "IN_PROGRESS" && (
          <ActionBtn icon={CheckCircle2} onClick={() => onRequestDone(item.id)}>
            Mark Done
          </ActionBtn>
        )}
        {needsApproval && (
          <>
            <ActionBtn icon={ThumbsUp} onClick={() => onApprove(item.id)} variant="success">
              Approve
            </ActionBtn>
            <ActionBtn icon={ThumbsDown} onClick={() => onReject(item.id)} variant="destructive">
              Reject
            </ActionBtn>
          </>
        )}
      </div>
    </div>
  );
}

function ActionBtn({
  icon: Icon,
  onClick,
  children,
  variant = "primary",
}: {
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  children: React.ReactNode;
  variant?: "primary" | "success" | "destructive";
}) {
  const styles = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90",
    success: "bg-success text-success-foreground hover:bg-success/90",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  };
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium",
        styles[variant],
      )}
    >
      <Icon className="h-3.5 w-3.5" /> {children}
    </button>
  );
}
