import { useState, type ReactNode } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface ExpandableListProps {
  title: string;
  count: number;
  children: ReactNode;
}

export function ExpandableList({ title, count, children }: ExpandableListProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between px-6 py-4 text-left"
      >
        <div className="flex items-center gap-2">
          <h2 className="font-semibold">{title}</h2>
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
            {count}
          </span>
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>
      {expanded && (
        <div className="divide-y divide-border border-t border-border px-6 py-2">
          {children}
        </div>
      )}
    </div>
  );
}
