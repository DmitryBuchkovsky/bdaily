import { Plus, Trash2, Star } from "lucide-react";
import type { TodayItem } from "@/hooks/useDailyReport";
import { FormInput } from "@/components/ui/FormInput";
import { TicketAutocomplete } from "./TicketAutocomplete";
import { cn } from "@/lib/utils";

interface TodaySectionProps {
  items: TodayItem[];
  onChange: (items: TodayItem[]) => void;
}

function updateAt(items: TodayItem[], i: number, patch: Partial<TodayItem>): TodayItem[] {
  const copy = [...items];
  copy[i] = { ...copy[i], ...patch } as TodayItem;
  return copy;
}

export function TodaySection({ items, onChange }: TodaySectionProps) {
  return (
    <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Working On Today</h2>
          <p className="text-sm text-muted-foreground">What are you planning to work on?</p>
        </div>
        <button
          onClick={() => onChange([...items, { priority: "SECONDARY", title: "" }])}
          className="flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-2 text-sm font-medium text-primary hover:bg-primary/20"
        >
          <Plus className="h-4 w-4" /> Add task
        </button>
      </div>

      {items.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">No tasks planned yet.</p>
      ) : (
        <div className="space-y-4">
          {items.map((item, i) => (
            <div key={i} className={cn("rounded-lg border bg-background p-4", item.priority === "PRIMARY" ? "border-primary/30 ring-1 ring-primary/10" : "border-border")}>
              <div className="mb-3 flex items-center justify-between">
                <button
                  onClick={() => onChange(updateAt(items, i, { priority: item.priority === "PRIMARY" ? "SECONDARY" : "PRIMARY" }))}
                  className={cn("flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium", item.priority === "PRIMARY" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground")}
                >
                  <Star className={cn("h-3 w-3", item.priority === "PRIMARY" && "fill-primary")} />
                  {item.priority === "PRIMARY" ? "Primary" : "Secondary"}
                </button>
                <button onClick={() => onChange(items.filter((_, j) => j !== i))} className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-3">
                <TicketAutocomplete selectedTicket={item.ticketId ? { id: item.ticketId, summary: item.title } : undefined} onChange={(t) => onChange(updateAt(items, i, { ticketId: t?.id, title: t?.summary ?? item.title }))} />
                <FormInput value={item.title} onChange={(v) => onChange(updateAt(items, i, { title: v }))} placeholder="Task title" />
                <div className="grid gap-3 sm:grid-cols-2">
                  <FormInput value={item.goal ?? ""} onChange={(v) => onChange(updateAt(items, i, { goal: v }))} placeholder="Goal for today" />
                  <FormInput value={item.approach ?? ""} onChange={(v) => onChange(updateAt(items, i, { approach: v }))} placeholder="Approach / plan" />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">ETA to DEV</label>
                  <FormInput type="date" value={item.etaToDev ?? ""} onChange={(v) => onChange(updateAt(items, i, { etaToDev: v || undefined }))} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
