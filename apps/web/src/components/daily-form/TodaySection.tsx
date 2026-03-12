import { Plus, Trash2, Star } from "lucide-react";
import type { TodayItem } from "@/hooks/useDailyReport";
import { TicketAutocomplete } from "./TicketAutocomplete";
import { cn } from "@/lib/utils";

interface TodaySectionProps {
  items: TodayItem[];
  onChange: (items: TodayItem[]) => void;
}

export function TodaySection({ items, onChange }: TodaySectionProps) {
  function addItem() {
    onChange([...items, { priority: "SECONDARY", title: "" }]);
  }

  function updateItem(index: number, updates: Partial<TodayItem>) {
    const updated = [...items];
    updated[index] = { ...updated[index], ...updates } as TodayItem;
    onChange(updated);
  }

  function removeItem(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  return (
    <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Working On Today</h2>
          <p className="text-sm text-muted-foreground">
            What are you planning to work on?
          </p>
        </div>
        <button
          onClick={addItem}
          className="flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
        >
          <Plus className="h-4 w-4" />
          Add task
        </button>
      </div>

      {items.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          No tasks planned. Click "Add task" to start.
        </p>
      ) : (
        <div className="space-y-4">
          {items.map((item, index) => (
            <div
              key={index}
              className={cn(
                "rounded-lg border bg-background p-4",
                item.priority === "PRIMARY"
                  ? "border-primary/30 ring-1 ring-primary/10"
                  : "border-border",
              )}
            >
              <div className="mb-3 flex items-center justify-between">
                <button
                  onClick={() =>
                    updateItem(index, {
                      priority:
                        item.priority === "PRIMARY" ? "SECONDARY" : "PRIMARY",
                    })
                  }
                  className={cn(
                    "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors",
                    item.priority === "PRIMARY"
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground hover:bg-muted/80",
                  )}
                >
                  <Star
                    className={cn(
                      "h-3 w-3",
                      item.priority === "PRIMARY" && "fill-primary",
                    )}
                  />
                  {item.priority === "PRIMARY" ? "Primary" : "Secondary"}
                </button>
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
                  placeholder="Task title"
                />

                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    value={item.goal ?? ""}
                    onChange={(e) =>
                      updateItem(index, { goal: e.target.value })
                    }
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
                    placeholder="Goal for today"
                  />
                  <input
                    value={item.approach ?? ""}
                    onChange={(e) =>
                      updateItem(index, { approach: e.target.value })
                    }
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
                    placeholder="Approach / plan"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">
                    ETA to DEV
                  </label>
                  <input
                    type="date"
                    value={item.etaToDev ?? ""}
                    onChange={(e) =>
                      updateItem(index, { etaToDev: e.target.value || undefined })
                    }
                    className="rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
