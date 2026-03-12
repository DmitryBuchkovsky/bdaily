import { useParams } from "react-router-dom";
import { Target, Bug, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useSprintSummary } from "@/hooks/useSummary";
import { SprintHeader } from "@/components/summary/SprintHeader";
import { ProgressBar } from "@/components/summary/ProgressBar";
import { TeamTable } from "@/components/summary/TeamTable";

export function SprintSummaryPage() {
  const { sprintId } = useParams();
  const { data: summary, isLoading } = useSprintSummary(sprintId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!summary) {
    return <div className="py-20 text-center text-muted-foreground">Sprint not found</div>;
  }

  const { stats } = summary;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <SprintHeader summary={summary} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SprintStatCard icon={<Target className="h-5 w-5 text-primary" />} label="Stories">
          <p className="mt-2 text-2xl font-bold">{stats.completedStories}/{stats.totalStories}</p>
          <ProgressBar label="" current={stats.completedStories} total={stats.totalStories} color="bg-primary" />
        </SprintStatCard>
        <SprintStatCard icon={<Bug className="h-5 w-5 text-destructive" />} label="Bugs">
          <p className="mt-2 text-2xl font-bold">{stats.resolvedBugs}/{stats.totalBugs}</p>
          <ProgressBar label="" current={stats.resolvedBugs} total={stats.totalBugs} color="bg-destructive" />
        </SprintStatCard>
        <SprintStatCard icon={<AlertTriangle className="h-5 w-5 text-warning" />} label="Active Blockers">
          <p className="mt-2 text-2xl font-bold">{stats.activeBlockers}</p>
        </SprintStatCard>
        <SprintStatCard icon={<CheckCircle2 className="h-5 w-5 text-success" />} label="Team Size">
          <p className="mt-2 text-2xl font-bold">{summary.members.length}</p>
        </SprintStatCard>
      </div>

      <TeamTable members={summary.members} />
    </div>
  );
}

interface SprintStatCardProps {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}

function SprintStatCard({ icon, label, children }: SprintStatCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center gap-3">
        {icon}
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
      </div>
      {children}
    </div>
  );
}
