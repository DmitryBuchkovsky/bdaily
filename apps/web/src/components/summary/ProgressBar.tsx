import { cn } from "@/lib/utils";

interface ProgressBarProps {
  label: string;
  current: number;
  total: number;
  color?: string;
}

export function ProgressBar({
  label,
  current,
  total,
  color = "bg-primary",
}: ProgressBarProps) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">
          {current}/{total} ({pct}%)
        </span>
      </div>
      <div className="mt-1 h-2 rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-all", color)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
