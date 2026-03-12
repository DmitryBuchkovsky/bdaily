import { Link } from "react-router-dom";
import { format } from "date-fns";
import { Clock, ArrowRight } from "lucide-react";
import type { DailyReport } from "@/hooks/useDailyReport";

interface RecentReportsListProps {
  reports: DailyReport[];
  isLoading: boolean;
}

export function RecentReportsList({
  reports,
  isLoading,
}: RecentReportsListProps) {
  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      <div className="border-b border-border px-6 py-4">
        <h2 className="font-semibold">Recent Reports</h2>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : reports.length === 0 ? (
        <div className="py-12 text-center text-sm text-muted-foreground">
          No reports yet. Start by filling in today's daily.
        </div>
      ) : (
        <div className="divide-y divide-border">
          {reports.map((report) => (
            <Link
              key={report.id}
              to={`/daily/${report.date}`}
              className="flex items-center justify-between px-6 py-3 transition-colors hover:bg-accent"
            >
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">
                    {format(new Date(report.date), "EEEE, MMM d")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {report.completedItems?.length ?? 0} completed,{" "}
                    {report.todayItems?.length ?? 0} planned
                  </p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
