import { CheckCircle2, Bug, TestTube, AlertTriangle, FileText } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { usePersonSummary } from "@/hooks/useSummary";
import { StatCard } from "@/components/summary/StatCard";
import { ExpandableList } from "@/components/summary/ExpandableList";
import { PageInfoBlock } from "@/components/ui/PageInfoBlock";
import { cn } from "@/lib/utils";

export function PersonSummaryPage() {
  const { user } = useAuth();
  const { data: summary, isLoading } = usePersonSummary(user?.id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const stats = summary?.stats;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Summary</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {summary ? `${summary.period.from} — ${summary.period.to}` : "Overview of your activity"}
        </p>
      </div>

      <PageInfoBlock
        storageKey="my-summary"
        title="Your Activity Summary"
        description="An aggregated view of your work across all daily reports. Track your completed tasks, bugs fixed, tickets tested, and blockers raised over time."
      />

      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard
          icon={<CheckCircle2 className="h-5 w-5" />}
          label="Tasks Done"
          value={stats?.tasksCompleted ?? 0}
          color="text-success"
        />
        <StatCard
          icon={<Bug className="h-5 w-5" />}
          label="Bugs Fixed"
          value={stats?.bugsFixed ?? 0}
          color="text-destructive"
        />
        <StatCard
          icon={<TestTube className="h-5 w-5" />}
          label="Tested"
          value={stats?.ticketsTested ?? 0}
          color="text-primary"
        />
        <StatCard
          icon={<AlertTriangle className="h-5 w-5" />}
          label="Blockers"
          value={stats?.blockersRaised ?? 0}
          color="text-warning"
        />
        <StatCard
          icon={<FileText className="h-5 w-5" />}
          label="Dailies"
          value={stats?.dailiesFiled ?? 0}
          color="text-muted-foreground"
        />
      </div>

      <ExpandableList title="Completed Items" count={summary?.completedItems?.length ?? 0}>
        {summary?.completedItems?.map((item) => (
          <div key={item.id} className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium">{item.title}</p>
              <p className="text-xs text-muted-foreground">
                {item.ticketId && (
                  <span className="mr-2 font-mono text-primary">{item.ticketId}</span>
                )}
                {item.date}
              </p>
            </div>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-xs font-medium",
                item.type === "BUG_FIX"
                  ? "bg-destructive/10 text-destructive"
                  : "bg-primary/10 text-primary",
              )}
            >
              {item.type === "BUG_FIX" ? "Bug" : "Task"}
            </span>
          </div>
        ))}
      </ExpandableList>

      <ExpandableList title="Blockers" count={summary?.blockers?.length ?? 0}>
        {summary?.blockers?.map((b) => (
          <div key={b.id} className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium">{b.description}</p>
              <p className="text-xs text-muted-foreground">
                {b.type} — {b.date}
              </p>
            </div>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-xs font-medium",
                b.resolved ? "bg-success/10 text-success" : "bg-warning/10 text-warning",
              )}
            >
              {b.resolved ? "Resolved" : "Active"}
            </span>
          </div>
        ))}
      </ExpandableList>
    </div>
  );
}
