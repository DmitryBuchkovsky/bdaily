import type { SprintSummary } from "@/hooks/useSummary";

interface SprintHeaderProps {
  summary: SprintSummary;
}

export function SprintHeader({ summary }: SprintHeaderProps) {
  return (
    <div>
      <h1 className="text-2xl font-bold">{summary.sprintName}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {summary.period.from} — {summary.period.to}
      </p>
    </div>
  );
}
