import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  CheckCircle2,
  Bug,
  TestTube,
  AlertTriangle,
  FileText,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

interface PersonSummary {
  userId: string;
  userName: string;
  period: { from: string; to: string };
  stats: {
    tasksCompleted: number;
    bugsFixed: number;
    ticketsTested: number;
    blockersRaised: number;
    dailiesFiled: number;
    prCount: number;
  };
  completedItems: {
    id: string;
    title: string;
    type: string;
    ticketId?: string;
    date: string;
  }[];
  blockers: {
    id: string;
    description: string;
    type: string;
    date: string;
    resolved: boolean;
  }[];
}

export function PersonSummaryPage() {
  const { user } = useAuth();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const { data: summary, isLoading } = useQuery({
    queryKey: ["summary", "person", user?.id],
    queryFn: () => api.get<PersonSummary>(`/summary/person/${user?.id}`),
    enabled: !!user?.id,
  });

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
          {summary
            ? `${summary.period.from} — ${summary.period.to}`
            : "Overview of your activity"}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard
          icon={CheckCircle2}
          label="Tasks Done"
          value={stats?.tasksCompleted ?? 0}
          color="text-success"
        />
        <StatCard
          icon={Bug}
          label="Bugs Fixed"
          value={stats?.bugsFixed ?? 0}
          color="text-destructive"
        />
        <StatCard
          icon={TestTube}
          label="Tested"
          value={stats?.ticketsTested ?? 0}
          color="text-primary"
        />
        <StatCard
          icon={AlertTriangle}
          label="Blockers"
          value={stats?.blockersRaised ?? 0}
          color="text-warning"
        />
        <StatCard
          icon={FileText}
          label="Dailies"
          value={stats?.dailiesFiled ?? 0}
          color="text-muted-foreground"
        />
        <StatCard
          icon={FileText}
          label="PRs"
          value={stats?.prCount ?? 0}
          color="text-primary"
        />
      </div>

      <ExpandableList
        title="Completed Items"
        count={summary?.completedItems?.length ?? 0}
        isExpanded={expandedSection === "completed"}
        onToggle={() =>
          setExpandedSection(
            expandedSection === "completed" ? null : "completed",
          )
        }
      >
        {summary?.completedItems?.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between py-2"
          >
            <div>
              <p className="text-sm font-medium">{item.title}</p>
              <p className="text-xs text-muted-foreground">
                {item.ticketId && (
                  <span className="mr-2 font-mono text-primary">
                    {item.ticketId}
                  </span>
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

      <ExpandableList
        title="Blockers"
        count={summary?.blockers?.length ?? 0}
        isExpanded={expandedSection === "blockers"}
        onToggle={() =>
          setExpandedSection(
            expandedSection === "blockers" ? null : "blockers",
          )
        }
      >
        {summary?.blockers?.map((blocker) => (
          <div
            key={blocker.id}
            className="flex items-center justify-between py-2"
          >
            <div>
              <p className="text-sm font-medium">{blocker.description}</p>
              <p className="text-xs text-muted-foreground">
                {blocker.type} — {blocker.date}
              </p>
            </div>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-xs font-medium",
                blocker.resolved
                  ? "bg-success/10 text-success"
                  : "bg-warning/10 text-warning",
              )}
            >
              {blocker.resolved ? "Resolved" : "Active"}
            </span>
          </div>
        ))}
      </ExpandableList>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm text-center">
      <Icon className={cn("mx-auto h-5 w-5 mb-1", color)} />
      <p className="text-xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function ExpandableList({
  title,
  count,
  isExpanded,
  onToggle,
  children,
}: {
  title: string;
  count: number;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between px-6 py-4 text-left"
      >
        <div className="flex items-center gap-2">
          <h2 className="font-semibold">{title}</h2>
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
            {count}
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>
      {isExpanded && (
        <div className="divide-y divide-border border-t border-border px-6 py-2">
          {children}
        </div>
      )}
    </div>
  );
}
