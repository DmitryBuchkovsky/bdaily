import { CheckCircle2, AlertTriangle, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TeamMemberDaily } from "@/hooks/useSummary";

interface MemberDailyCardProps {
  member: TeamMemberDaily;
  expanded: boolean;
  onToggle: () => void;
}

export function MemberDailyCard({ member, expanded, onToggle }: MemberDailyCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      <button onClick={onToggle} className="flex w-full items-center justify-between px-6 py-4 text-left">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">{member.userName.charAt(0).toUpperCase()}</div>
          <div>
            <p className="font-medium">{member.userName}</p>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {member.hasDailyReport ? (
                <>
                  <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-success" />{member.completedCount} done</span>
                  <span>{member.todayCount} planned</span>
                  {member.blockerCount > 0 && <span className="flex items-center gap-1 text-warning"><AlertTriangle className="h-3 w-3" />{member.blockerCount} blocked</span>}
                </>
              ) : <span className="italic">No report filed</span>}
            </div>
          </div>
        </div>
        <ChevronRight className={cn("h-4 w-4 text-muted-foreground transition-transform", expanded && "rotate-90")} />
      </button>
      {expanded && member.hasDailyReport && (
        <div className="border-t border-border px-6 py-4">
          <div className="grid gap-6 md:grid-cols-3">
            <ItemList title="Completed" items={member.completedItems} />
            <ItemList title="Today" items={member.todayItems} />
            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Blockers</h3>
              {member.blockers.length === 0 ? <p className="text-sm text-muted-foreground">None</p> : (
                <ul className="space-y-1">
                  {member.blockers.map((b, i) => <li key={i} className="text-sm"><span className="mr-1.5 rounded bg-warning/10 px-1 py-0.5 text-xs text-warning">{b.type}</span>{b.description}</li>)}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ItemList({ title, items }: { title: string; items: { title: string; ticketId?: string }[] }) {
  return (
    <div>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</h3>
      {items.length === 0 ? <p className="text-sm text-muted-foreground">None</p> : (
        <ul className="space-y-1">
          {items.map((item, i) => <li key={i} className="text-sm">{item.ticketId && <span className="mr-1.5 font-mono text-xs text-primary">{item.ticketId}</span>}{item.title}</li>)}
        </ul>
      )}
    </div>
  );
}
