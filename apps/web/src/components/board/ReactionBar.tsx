import { useState } from "react";
import { SmilePlus } from "lucide-react";
import { useReactions, useToggleReaction } from "@/hooks/useReportInteractions";
import { cn } from "@/lib/utils";

const QUICK_EMOJIS = ["👍", "🔥", "💡", "👀", "🎉", "❤️", "🚀", "⚠️"];

interface ReactionBarProps {
  reportId: string;
}

export function ReactionBar({ reportId }: ReactionBarProps) {
  const { data: reactions } = useReactions(reportId);
  const toggle = useToggleReaction(reportId);
  const [pickerOpen, setPickerOpen] = useState(false);

  const handleToggle = (emoji: string) => {
    toggle.mutate(emoji);
    setPickerOpen(false);
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {reactions?.map((r) => (
        <button
          key={r.emoji}
          onClick={() => handleToggle(r.emoji)}
          title={r.users.map((u) => u.name).join(", ")}
          className={cn(
            "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-sm transition-colors",
            r.currentUserReacted
              ? "border-primary/50 bg-primary/10 text-primary"
              : "border-border bg-card text-muted-foreground hover:border-primary/30",
          )}
        >
          <span>{r.emoji}</span>
          <span className="text-xs font-medium">{r.count}</span>
        </button>
      ))}

      <div className="relative">
        <button
          onClick={() => setPickerOpen((v) => !v)}
          className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-dashed border-border text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
        >
          <SmilePlus className="h-3.5 w-3.5" />
        </button>

        {pickerOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setPickerOpen(false)} />
            <div className="absolute bottom-full left-0 z-50 mb-2 flex gap-1 rounded-xl border bg-card p-2 shadow-lg">
              {QUICK_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleToggle(emoji)}
                  className="rounded-lg p-1.5 text-lg transition-colors hover:bg-accent"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
