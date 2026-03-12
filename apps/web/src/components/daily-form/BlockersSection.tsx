import { Plus, Trash2, AlertTriangle } from "lucide-react";
import type { Blocker } from "@/hooks/useDailyReport";
import { FormInput } from "@/components/ui/FormInput";
import { FormTextarea } from "@/components/ui/FormTextarea";
import { cn } from "@/lib/utils";

interface BlockersSectionProps {
  items: Blocker[];
  onChange: (items: Blocker[]) => void;
}

function updateAt(items: Blocker[], i: number, patch: Partial<Blocker>): Blocker[] {
  const copy = [...items];
  copy[i] = { ...copy[i], ...patch } as Blocker;
  return copy;
}

export function BlockersSection({ items, onChange }: BlockersSectionProps) {
  return (
    <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-warning" />
          <div>
            <h2 className="text-lg font-semibold">Blockers</h2>
            <p className="text-sm text-muted-foreground">Anything blocking your progress?</p>
          </div>
        </div>
        <button
          onClick={() => onChange([...items, { type: "TECHNICAL", description: "" }])}
          className="flex items-center gap-1.5 rounded-lg bg-warning/10 px-3 py-2 text-sm font-medium text-warning hover:bg-warning/20"
        >
          <Plus className="h-4 w-4" /> Add blocker
        </button>
      </div>

      {items.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">No blockers — great!</p>
      ) : (
        <div className="space-y-4">
          {items.map((item, i) => (
            <div key={i} className="rounded-lg border border-warning/30 bg-background p-4">
              <div className="mb-3 flex items-center justify-between">
                <select
                  value={item.type}
                  onChange={(e) => onChange(updateAt(items, i, { type: e.target.value as Blocker["type"] }))}
                  className={cn("rounded-full border-none px-3 py-1 text-xs font-medium outline-none", item.type === "TECHNICAL" ? "bg-primary/10 text-primary" : "bg-warning/10 text-warning")}
                >
                  <option value="TECHNICAL">Technical</option>
                  <option value="DEPENDENCY">Dependency</option>
                </select>
                <button onClick={() => onChange(items.filter((_, j) => j !== i))} className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-3">
                <FormTextarea value={item.description} onChange={(v) => onChange(updateAt(items, i, { description: v }))} placeholder="Describe the blocker..." rows={2} />
                <div className="grid gap-3 sm:grid-cols-2">
                  <FormInput value={item.impact ?? ""} onChange={(v) => onChange(updateAt(items, i, { impact: v }))} placeholder="Impact on work" />
                  <FormInput value={item.need ?? ""} onChange={(v) => onChange(updateAt(items, i, { need: v }))} placeholder="What do you need?" />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <FormInput value={item.waitingFor ?? ""} onChange={(v) => onChange(updateAt(items, i, { waitingFor: v }))} placeholder="Waiting for (person/team)" />
                  <FormInput value={item.expectedResolution ?? ""} onChange={(v) => onChange(updateAt(items, i, { expectedResolution: v }))} placeholder="Expected resolution" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
