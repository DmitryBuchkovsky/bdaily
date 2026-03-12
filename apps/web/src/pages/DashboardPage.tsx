import { format } from "date-fns";
import { CheckCircle2, AlertTriangle, FileText } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useDailyReport, useDailyReportHistory } from "@/hooks/useDailyReport";
import { StatCard } from "@/components/dashboard/StatCard";
import { RecentReportsList } from "@/components/dashboard/RecentReportsList";
import { TodayStatus } from "@/components/dashboard/TodayStatus";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}

export function DashboardPage() {
  const { user } = useAuth();
  const today = format(new Date(), "yyyy-MM-dd");
  const { data: todayReport } = useDailyReport(today);
  const { data: history, isLoading } = useDailyReportHistory();

  const reports = history?.reports ?? [];
  const recentReports = reports.slice(0, 5);
  const completedCount = reports.reduce(
    (sum, r) => sum + (r.completedItems?.length ?? 0),
    0,
  );
  const blockerCount = reports.reduce(
    (sum, r) => sum + (r.blockers?.length ?? 0),
    0,
  );

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

      <TodayStatus report={todayReport} today={today} />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={<CheckCircle2 className="h-5 w-5" />} label="Items Completed" value={completedCount} color="text-success" />
        <StatCard icon={<AlertTriangle className="h-5 w-5" />} label="Blockers Raised" value={blockerCount} color="text-warning" />
        <StatCard icon={<FileText className="h-5 w-5" />} label="Reports Filed" value={reports.length} color="text-primary" />
      </div>

      <RecentReportsList reports={recentReports} isLoading={isLoading} />
    </div>
  );
}
