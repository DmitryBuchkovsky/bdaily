import { Plus, Trash2 } from "lucide-react";
import type { CompletedItem } from "@/hooks/useDailyReport";
import { FormInput } from "@/components/ui/FormInput";
import { FormSelect } from "@/components/ui/FormSelect";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { TicketAutocomplete } from "./TicketAutocomplete";
import { cn } from "@/lib/utils";

interface CompletedSectionProps {
  items: CompletedItem[];
  onChange: (items: CompletedItem[]) => void;
}

const statusOptions = [
  { value: "COMPLETED", label: "Completed" },
  { value: "MERGED", label: "Merged" },
  { value: "DEPLOYED", label: "Deployed" },
];

function patch(items: CompletedItem[], i: number, p: Partial<CompletedItem>): CompletedItem[] {
  const c = [...items];
  c[i] = { ...c[i], ...p } as CompletedItem;
  return c;
}

export function CompletedSection({ items, onChange }: CompletedSectionProps) {
  return (
    <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Completed Yesterday</h2>
          <p className="text-sm text-muted-foreground">What did you finish since last report?</p>
        </div>
        <button
          onClick={() => onChange([...items, { type: "TASK", title: "", status: "COMPLETED" }])}
          className="flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-2 text-sm font-medium text-primary hover:bg-primary/20"
        >
          <Plus className="h-4 w-4" /> Add item
        </button>
      </div>
      {items.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">No completed items yet.</p>
      ) : (
        <div className="space-y-4">
          {items.map((item, i) => (
            <div key={i} className="rounded-lg border border-border bg-background p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      onChange(patch(items, i, { type: item.type === "TASK" ? "BUG_FIX" : "TASK" }))
                    }
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-medium",
                      item.type === "TASK"
                        ? "bg-primary/10 text-primary"
                        : "bg-destructive/10 text-destructive",
                    )}
                  >
                    {item.type === "TASK" ? "Task" : "Bug Fix"}
                  </button>
                  <FormSelect
                    value={item.status}
                    onChange={(v) =>
                      onChange(patch(items, i, { status: v as CompletedItem["status"] }))
                    }
                    options={statusOptions}
                    className="text-xs"
                  />
                </div>
                <button
                  onClick={() => onChange(items.filter((_, j) => j !== i))}
                  className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-3">
                <TicketAutocomplete
                  selectedTicket={
                    item.ticketId ? { id: item.ticketId, summary: item.title } : undefined
                  }
                  onChange={(t) =>
                    onChange(patch(items, i, { ticketId: t?.id, title: t?.summary ?? item.title }))
                  }
                />
                <FormInput
                  value={item.title}
                  onChange={(v) => onChange(patch(items, i, { title: v }))}
                  placeholder="Title / summary"
                />
                <RichTextEditor
                  value={item.details ?? ""}
                  onChange={(v) => onChange(patch(items, i, { details: v }))}
                  placeholder="Details (optional)"
                  minimal
                  mentionsEnabled
                />
                <FormInput
                  value={item.prLink ?? ""}
                  onChange={(v) => onChange(patch(items, i, { prLink: v }))}
                  placeholder="PR link (optional)"
                />
                {item.type === "BUG_FIX" && (
                  <div className="space-y-3 rounded-lg border border-destructive/20 bg-destructive/5 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-destructive">
                      Bug Details
                    </p>
                    <RichTextEditor
                      value={item.rootCause ?? ""}
                      onChange={(v) => onChange(patch(items, i, { rootCause: v }))}
                      placeholder="Root cause"
                      minimal
                    />
                    <RichTextEditor
                      value={item.solution ?? ""}
                      onChange={(v) => onChange(patch(items, i, { solution: v }))}
                      placeholder="Solution"
                      minimal
                    />
                    <RichTextEditor
                      value={item.impact ?? ""}
                      onChange={(v) => onChange(patch(items, i, { impact: v }))}
                      placeholder="Impact"
                      minimal
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
