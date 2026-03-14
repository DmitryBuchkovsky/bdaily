import { Link } from "react-router-dom";
import { format } from "date-fns";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReportItem {
  title?: string;
  [key: string]: unknown;
}

interface MemberReport {
  id: string;
  date: string;
  completedItems: ReportItem[];
  todayItems: ReportItem[];
  blockers: ReportItem[];
  questions: ReportItem[];
}

interface MemberReportCardProps {
  report: MemberReport;
  userId: string;
}

export function MemberReportCard({ report, userId }: MemberReportCardProps) {
  const completed = report.completedItems?.length ?? 0;
  const today = report.todayItems?.length ?? 0;
  const blockers = report.blockers?.length ?? 0;
  const questions = report.questions?.length ?? 0;

  return (
    <Link
      to={`/board/${userId}/${report.date}`}
      className={cn(
        "flex items-center justify-between rounded-lg border bg-card px-4 py-3",
        "transition-colors hover:border-primary/30 hover:bg-accent/50",
      )}
    >
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium">{format(new Date(report.date), "EEE, MMM d")}</span>
        <div className="flex gap-2 text-xs text-muted-foreground">
          <span>{completed} done</span>
          <span>·</span>
          <span>{today} planned</span>
          {blockers > 0 && (
            <>
              <span>·</span>
              <span className="text-warning">{blockers} blocked</span>
            </>
          )}
          {questions > 0 && (
            <>
              <span>·</span>
              <span>{questions} questions</span>
            </>
          )}
        </div>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </Link>
  );
}
