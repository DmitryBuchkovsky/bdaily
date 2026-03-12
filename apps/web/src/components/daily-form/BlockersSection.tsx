import { Plus, Trash2, AlertTriangle } from "lucide-react";
import type { Blocker } from "@/hooks/useDailyReport";
import { cn } from "@/lib/utils";

interface BlockersSectionProps {
  items: Blocker[];
  onChange: (items: Blocker[]) => void;
}

const emptyBlocker: Blocker = {
  type: "TECHNICAL",
  description: "",
};

export function BlockersSection({ items, onChange }: BlockersSectionProps) {
  function addItem() {
    onChange([...items, { ...emptyBlocker }]);
  }

  function updateItem(index: number, updates: Partial<Blocker>) {
    const updated = [...items];
    updated[index] = { ...updated[index], ...updates } as Blocker;
    onChange(updated);
  }

  function removeItem(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  return (
    <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-warning" />
          <div>
            <h2 className="text-lg font-semibold">Blockers</h2>
            <p className="text-sm text-muted-foreground">
              Anything blocking your progress?
            </p>
          </div>
        </div>
        <button
          onClick={addItem}
          className="flex items-center gap-1.5 rounded-lg bg-warning/10 px-3 py-2 text-sm font-medium text-warning transition-colors hover:bg-warning/20"
        >
          <Plus className="h-4 w-4" />
          Add blocker
        </button>
      </div>

      {items.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          No blockers — great! Add one if something is in your way.
        </p>
      ) : (
        <div className="space-y-4">
          {items.map((item, index) => (
            <div
              key={index}
              className="rounded-lg border border-warning/30 bg-background p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <select
                  value={item.type}
                  onChange={(e) =>
                    updateItem(index, {
                      type: e.target.value as Blocker["type"],
                    })
                  }
                  className={cn(
                    "rounded-full border-none px-3 py-1 text-xs font-medium outline-none",
                    item.type === "TECHNICAL"
                      ? "bg-primary/10 text-primary"
                      : "bg-warning/10 text-warning",
                  )}
                >
                  <option value="TECHNICAL">Technical</option>
                  <option value="DEPENDENCY">Dependency</option>
                </select>
                <button
                  onClick={() => removeItem(index)}
                  className="rounded p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-3">
                <textarea
                  value={item.description}
                  onChange={(e) =>
                    updateItem(index, { description: e.target.value })
                  }
                  rows={2}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
                  placeholder="Describe the blocker..."
                />

                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    value={item.impact ?? ""}
                    onChange={(e) =>
                      updateItem(index, { impact: e.target.value })
                    }
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
                    placeholder="Impact on work"
                  />
                  <input
                    value={item.need ?? ""}
                    onChange={(e) =>
                      updateItem(index, { need: e.target.value })
                    }
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
                    placeholder="What do you need?"
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    value={item.waitingFor ?? ""}
                    onChange={(e) =>
                      updateItem(index, { waitingFor: e.target.value })
                    }
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
                    placeholder="Waiting for (person/team)"
                  />
                  <input
                    value={item.expectedResolution ?? ""}
                    onChange={(e) =>
                      updateItem(index, {
                        expectedResolution: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
                    placeholder="Expected resolution"
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
