import { Link } from "react-router-dom";
import { format } from "date-fns";
import {
  FileText,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Clock,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useDailyReport, useDailyReportHistory } from "@/hooks/useDailyReport";
import { cn } from "@/lib/utils";

export function DashboardPage() {
  const { user } = useAuth();
  const today = format(new Date(), "yyyy-MM-dd");
  const { data: todayReport } = useDailyReport(today);
  const { data: history, isLoading } = useDailyReportHistory();

  const recentReports = history?.slice(0, 5) ?? [];
  const completedCount =
    history?.reduce((sum, r) => sum + (r.completedItems?.length ?? 0), 0) ?? 0;
  const blockerCount =
    history?.reduce((sum, r) => sum + (r.blockers?.length ?? 0), 0) ?? 0;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          Good {getGreeting()}, {user?.name?.split(" ")[0]}
        </h1>
        <p className="mt-1 text-muted-foreground">
          {format(new Date(), "EEEE, MMMM d, yyyy")}
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold">Today's Report</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {todayReport
                ? `Submitted at ${format(new Date(todayReport.updatedAt), "h:mm a")}`
                : "You haven't filled in today's report yet"}
            </p>
          </div>
          <Link
            to={`/daily/${today}`}
            className={cn(
              "flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
              todayReport
                ? "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                : "bg-primary text-primary-foreground hover:bg-primary/90",
            )}
          >
            {todayReport ? "Edit" : "Fill in"} daily
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {todayReport && (
          <div className="mt-4 grid grid-cols-3 gap-4 border-t border-border pt-4">
            <div className="text-center">
              <p className="text-2xl font-bold">
                {todayReport.completedItems?.length ?? 0}
              </p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">
                {todayReport.todayItems?.length ?? 0}
              </p>
              <p className="text-xs text-muted-foreground">Today's tasks</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">
                {todayReport.blockers?.length ?? 0}
              </p>
              <p className="text-xs text-muted-foreground">Blockers</p>
            </div>
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={CheckCircle2}
          label="Items Completed"
          value={completedCount}
          color="text-success"
        />
        <StatCard
          icon={AlertTriangle}
          label="Blockers Raised"
          value={blockerCount}
          color="text-warning"
        />
        <StatCard
          icon={FileText}
          label="Reports Filed"
          value={history?.length ?? 0}
          color="text-primary"
        />
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm">
        <div className="border-b border-border px-6 py-4">
          <h2 className="font-semibold">Recent Reports</h2>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : recentReports.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground">
            No reports yet. Start by filling in today's daily.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {recentReports.map((report) => (
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
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className={cn("rounded-lg bg-accent p-2", color)}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </div>
    </div>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}
