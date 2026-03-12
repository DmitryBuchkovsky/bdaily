import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Target, Bug, AlertTriangle, CheckCircle2 } from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

interface SprintSummary {
  sprintId: string;
  sprintName: string;
  period: { from: string; to: string };
  stats: {
    totalStories: number;
    completedStories: number;
    totalBugs: number;
    resolvedBugs: number;
    activeBlockers: number;
  };
  members: {
    userId: string;
    name: string;
    tasksCompleted: number;
    bugsFixed: number;
    blockersRaised: number;
    dailiesFiled: number;
  }[];
}

export function SprintSummaryPage() {
  const { sprintId } = useParams();

  const { data: summary, isLoading } = useQuery({
    queryKey: ["summary", "sprint", sprintId],
    queryFn: () => api.get<SprintSummary>(`/summary/sprint/${sprintId}`),
    enabled: !!sprintId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="py-20 text-center text-muted-foreground">
        Sprint not found
      </div>
    );
  }

  const storyProgress = summary.stats.totalStories
    ? Math.round(
        (summary.stats.completedStories / summary.stats.totalStories) * 100,
      )
    : 0;
  const bugProgress = summary.stats.totalBugs
    ? Math.round(
        (summary.stats.resolvedBugs / summary.stats.totalBugs) * 100,
      )
    : 0;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{summary.sprintName}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {summary.period.from} — {summary.period.to}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <Target className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">
              Stories
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold">
            {summary.stats.completedStories}/{summary.stats.totalStories}
          </p>
          <ProgressBar value={storyProgress} color="bg-primary" />
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <Bug className="h-5 w-5 text-destructive" />
            <span className="text-sm font-medium text-muted-foreground">
              Bugs
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold">
            {summary.stats.resolvedBugs}/{summary.stats.totalBugs}
          </p>
          <ProgressBar value={bugProgress} color="bg-destructive" />
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-warning" />
            <span className="text-sm font-medium text-muted-foreground">
              Active Blockers
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold">
            {summary.stats.activeBlockers}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-success" />
            <span className="text-sm font-medium text-muted-foreground">
              Team Size
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold">{summary.members.length}</p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm">
        <div className="border-b border-border px-6 py-4">
          <h2 className="font-semibold">Team Breakdown</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-6 py-3 text-left font-medium text-muted-foreground">
                  Member
                </th>
                <th className="px-6 py-3 text-center font-medium text-muted-foreground">
                  Tasks
                </th>
                <th className="px-6 py-3 text-center font-medium text-muted-foreground">
                  Bugs
                </th>
                <th className="px-6 py-3 text-center font-medium text-muted-foreground">
                  Blockers
                </th>
                <th className="px-6 py-3 text-center font-medium text-muted-foreground">
                  Dailies
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {summary.members.map((member) => (
                <tr
                  key={member.userId}
                  className="transition-colors hover:bg-accent"
                >
                  <td className="px-6 py-3 font-medium">{member.name}</td>
                  <td className="px-6 py-3 text-center">
                    {member.tasksCompleted}
                  </td>
                  <td className="px-6 py-3 text-center">
                    {member.bugsFixed}
                  </td>
                  <td className="px-6 py-3 text-center">
                    <span
                      className={cn(
                        member.blockersRaised > 0 &&
                          "text-warning font-medium",
                      )}
                    >
                      {member.blockersRaised}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-center">
                    {member.dailiesFiled}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ProgressBar({
  value,
  color,
}: {
  value: number;
  color: string;
}) {
  return (
    <div className="mt-2">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{value}%</span>
      </div>
      <div className="mt-1 h-2 rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-all", color)}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
