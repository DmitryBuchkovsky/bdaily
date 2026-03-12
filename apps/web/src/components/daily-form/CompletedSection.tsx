import { Plus, Trash2 } from "lucide-react";
import type { CompletedItem } from "@/hooks/useDailyReport";
import { TicketAutocomplete } from "./TicketAutocomplete";
import { cn } from "@/lib/utils";

interface CompletedSectionProps {
  items: CompletedItem[];
  onChange: (items: CompletedItem[]) => void;
}

const emptyItem: CompletedItem = {
  type: "TASK",
  title: "",
  status: "COMPLETED",
};

export function CompletedSection({ items, onChange }: CompletedSectionProps) {
  function addItem() {
    onChange([...items, { ...emptyItem }]);
  }

  function updateItem(index: number, updates: Partial<CompletedItem>) {
    const updated = [...items];
    updated[index] = { ...updated[index], ...updates } as CompletedItem;
    onChange(updated);
  }

  function removeItem(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  return (
    <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Completed Yesterday</h2>
          <p className="text-sm text-muted-foreground">
            What did you finish since last report?
          </p>
        </div>
        <button
          onClick={addItem}
          className="flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
        >
          <Plus className="h-4 w-4" />
          Add item
        </button>
      </div>

      {items.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          No completed items. Click "Add item" to get started.
        </p>
      ) : (
        <div className="space-y-4">
          {items.map((item, index) => (
            <div
              key={index}
              className="rounded-lg border border-border bg-background p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      updateItem(index, {
                        type: item.type === "TASK" ? "BUG_FIX" : "TASK",
                      })
                    }
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                      item.type === "TASK"
                        ? "bg-primary/10 text-primary"
                        : "bg-destructive/10 text-destructive",
                    )}
                  >
                    {item.type === "TASK" ? "Task" : "Bug Fix"}
                  </button>
                  <select
                    value={item.status}
                    onChange={(e) =>
                      updateItem(index, {
                        status: e.target.value as CompletedItem["status"],
                      })
                    }
                    className="rounded-lg border border-input bg-background px-2 py-1 text-xs outline-none focus:border-ring"
                  >
                    <option value="COMPLETED">Completed</option>
                    <option value="MERGED">Merged</option>
                    <option value="DEPLOYED">Deployed</option>
                  </select>
                </div>
                <button
                  onClick={() => removeItem(index)}
                  className="rounded p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-3">
                <TicketAutocomplete
                  selectedTicket={
                    item.ticketId
                      ? { id: item.ticketId, summary: item.title }
                      : undefined
                  }
                  onChange={(ticket) =>
                    updateItem(index, {
                      ticketId: ticket?.id ?? undefined,
                      title: ticket?.summary ?? item.title,
                    })
                  }
                />

                <input
                  value={item.title}
                  onChange={(e) =>
                    updateItem(index, { title: e.target.value })
                  }
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
                  placeholder="Title / summary"
                />

                <textarea
                  value={item.details ?? ""}
                  onChange={(e) =>
                    updateItem(index, { details: e.target.value })
                  }
                  rows={2}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
                  placeholder="Details (optional)"
                />

                <input
                  value={item.prLink ?? ""}
                  onChange={(e) =>
                    updateItem(index, { prLink: e.target.value })
                  }
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
                  placeholder="PR link (optional)"
                />

                {item.type === "BUG_FIX" && (
                  <div className="space-y-3 rounded-lg border border-destructive/20 bg-destructive/5 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-destructive">
                      Bug Details
                    </p>
                    <input
                      value={item.rootCause ?? ""}
                      onChange={(e) =>
                        updateItem(index, { rootCause: e.target.value })
                      }
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
                      placeholder="Root cause"
                    />
                    <input
                      value={item.solution ?? ""}
                      onChange={(e) =>
                        updateItem(index, { solution: e.target.value })
                      }
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
                      placeholder="Solution"
                    />
                    <input
                      value={item.impact ?? ""}
                      onChange={(e) =>
                        updateItem(index, { impact: e.target.value })
                      }
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
                      placeholder="Impact"
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
