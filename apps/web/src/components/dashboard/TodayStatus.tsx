import { Link } from "react-router-dom";
import { format } from "date-fns";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DailyReport } from "@/hooks/useDailyReport";

interface TodayStatusProps {
  report: DailyReport | undefined;
  today: string;
}

export function TodayStatus({ report, today }: TodayStatusProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold">Today's Report</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {report
              ? `Submitted at ${format(new Date(report.updatedAt), "h:mm a")}`
              : "You haven't filled in today's report yet"}
          </p>
        </div>
        <Link
          to={`/daily/${today}`}
          className={cn(
            "flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
            report
              ? "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              : "bg-primary text-primary-foreground hover:bg-primary/90",
          )}
        >
          {report ? "Edit" : "Fill in"} daily
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {report && (
        <div className="mt-4 grid grid-cols-3 gap-4 border-t border-border pt-4">
          <div className="text-center">
            <p className="text-2xl font-bold">
              {report.completedItems?.length ?? 0}
            </p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">
              {report.todayItems?.length ?? 0}
            </p>
            <p className="text-xs text-muted-foreground">Today's tasks</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">
              {report.blockers?.length ?? 0}
            </p>
            <p className="text-xs text-muted-foreground">Blockers</p>
          </div>
        </div>
      )}
    </div>
  );
}
