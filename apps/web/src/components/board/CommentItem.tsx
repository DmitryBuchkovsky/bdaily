import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, Trash2, CheckCircle2, Circle } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { RichContent } from "@/components/ui/RichContent";
import { cn } from "@/lib/utils";
import type { ReportComment } from "@/hooks/useReportInteractions";

interface CommentItemProps {
  comment: ReportComment;
  onReply: (parentId: string) => void;
  onResolve: (commentId: string, resolved: boolean) => void;
  onDelete: (commentId: string) => void;
  isAdmin: boolean;
  depth?: number;
}

export function CommentItem({
  comment,
  onReply,
  onResolve,
  onDelete,
  isAdmin,
  depth = 0,
}: CommentItemProps) {
  const { user } = useAuth();
  const isOwn = user?.id === comment.userId;
  const canResolve = isAdmin || isOwn;
  const [expanded, setExpanded] = useState(true);

  const timeAgo = formatDistanceToNow(new Date(comment.createdAt), {
    addSuffix: true,
  });

  return (
    <div className={cn(depth > 0 && "ml-6 border-l-2 border-border pl-4")}>
      <div
        className={cn(
          "rounded-lg border p-3",
          comment.resolved ? "border-success/30 bg-success/5" : "bg-card",
        )}
      >
        <div className="mb-1 flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
            {comment.user.name.charAt(0).toUpperCase()}
          </div>
          <span className="text-sm font-medium">{comment.user.name}</span>
          <span className="text-xs text-muted-foreground">{timeAgo}</span>
          {comment.resolved && (
            <span className="flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-xs text-success">
              <CheckCircle2 className="h-3 w-3" /> Resolved
            </span>
          )}
        </div>

        <RichContent html={comment.content} className="text-sm" />

        <div className="mt-2 flex items-center gap-3">
          {!comment.parentId && (
            <button
              onClick={() => onReply(comment.id)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
            >
              <MessageSquare className="h-3 w-3" /> Reply
            </button>
          )}
          {canResolve && !comment.parentId && (
            <button
              onClick={() => onResolve(comment.id, !comment.resolved)}
              className={cn(
                "flex items-center gap-1 text-xs",
                comment.resolved
                  ? "text-success hover:text-muted-foreground"
                  : "text-muted-foreground hover:text-success",
              )}
            >
              {comment.resolved ? (
                <>
                  <Circle className="h-3 w-3" /> Unresolve
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-3 w-3" /> Resolve
                </>
              )}
            </button>
          )}
          {isOwn && (
            <button
              onClick={() => onDelete(comment.id)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-3 w-3" /> Delete
            </button>
          )}
        </div>
      </div>

      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-2 space-y-2">
          {!expanded ? (
            <button
              onClick={() => setExpanded(true)}
              className="text-xs text-primary hover:underline"
            >
              Show {comment.replies.length} {comment.replies.length === 1 ? "reply" : "replies"}
            </button>
          ) : (
            comment.replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                onReply={onReply}
                onResolve={onResolve}
                onDelete={onDelete}
                isAdmin={isAdmin}
                depth={depth + 1}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
