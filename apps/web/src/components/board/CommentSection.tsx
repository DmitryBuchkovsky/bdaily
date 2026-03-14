import { useState, useRef } from "react";
import { MessageSquare, Send } from "lucide-react";
import { useAuth } from "@/lib/auth";
import {
  useComments,
  useAddComment,
  useResolveComment,
  useDeleteComment,
} from "@/hooks/useReportInteractions";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { CommentItem } from "./CommentItem";
import { cn } from "@/lib/utils";

interface CommentSectionProps {
  reportId: string;
}

export function CommentSection({ reportId }: CommentSectionProps) {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const { data: comments, isLoading } = useComments(reportId);
  const addComment = useAddComment(reportId);
  const resolveComment = useResolveComment(reportId);
  const deleteComment = useDeleteComment(reportId);

  const [content, setContent] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  const unresolvedCount = comments?.filter((c) => !c.parentId && !c.resolved).length ?? 0;

  const handleSubmit = () => {
    if (!content.trim() || content === "<p></p>") return;
    addComment.mutate(
      { content, parentId: replyTo ?? undefined },
      {
        onSuccess: () => {
          setContent("");
          setReplyTo(null);
        },
      },
    );
  };

  const handleReply = (parentId: string) => {
    setReplyTo(parentId);
    editorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const replyTarget = replyTo ? comments?.find((c) => c.id === replyTo) : null;

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-muted-foreground" />
        <h3 className="text-lg font-semibold">Discussion</h3>
        {unresolvedCount > 0 && (
          <span className="rounded-full bg-warning/10 px-2 py-0.5 text-xs font-medium text-warning">
            {unresolvedCount} unresolved
          </span>
        )}
        <span className="text-sm text-muted-foreground">
          {comments?.length ?? 0} {(comments?.length ?? 0) === 1 ? "thread" : "threads"}
        </span>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-4">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : (
        <div className="space-y-3">
          {comments?.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onReply={handleReply}
              onResolve={(id, resolved) => resolveComment.mutate({ commentId: id, resolved })}
              onDelete={(id) => deleteComment.mutate(id)}
              isAdmin={isAdmin}
            />
          ))}
        </div>
      )}

      <div ref={editorRef} className="rounded-xl border bg-card p-4">
        {replyTo && replyTarget && (
          <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
            <span>
              Replying to <strong>{replyTarget.user.name}</strong>
            </span>
            <button onClick={() => setReplyTo(null)} className="text-primary hover:underline">
              Cancel
            </button>
          </div>
        )}
        <RichTextEditor
          value={content}
          onChange={setContent}
          placeholder="Add a comment or question for the standup..."
          minimal
          mentionsEnabled
        />
        <div className="mt-2 flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={addComment.isPending || !content.trim() || content === "<p></p>"}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium",
              "text-primary-foreground hover:bg-primary/90",
              (addComment.isPending || !content.trim()) && "opacity-60",
            )}
          >
            <Send className="h-4 w-4" />
            {addComment.isPending ? "Posting…" : "Post"}
          </button>
        </div>
      </div>
    </section>
  );
}
