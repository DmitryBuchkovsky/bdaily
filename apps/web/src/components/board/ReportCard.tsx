import { Link } from "react-router-dom";
import { CheckCircle2, ListTodo, AlertTriangle, SmilePlus, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReportUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string | null;
}

interface ReportSummary {
  id: string;
  date: string;
  completedCount: number;
  todayCount: number;
  blockerCount: number;
  questionCount: number;
  reactionCount?: number;
  commentCount?: number;
}

interface ReportCardProps {
  user: ReportUser;
  hasReport: boolean;
  report: ReportSummary | null;
}

export function ReportCard({ user, hasReport, report }: ReportCardProps) {
  const initial = user.name.charAt(0).toUpperCase();
  return (
    <Link
      to={`/board/${user.id}`}
      className={cn(
        "block rounded-xl border bg-card p-4 transition-colors",
        "hover:border-primary/30",
      )}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt="" className="h-full w-full rounded-full object-cover" />
          ) : (
            initial
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-medium truncate">{user.name}</p>
          <span className="inline-block rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            {user.role}
          </span>
          {hasReport && report ? (
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="flex items-center gap-1 rounded-md bg-success/10 px-2 py-0.5 text-xs text-success">
                <CheckCircle2 className="h-3 w-3" />
                {report.completedCount}
              </span>
              <span className="flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-xs text-primary">
                <ListTodo className="h-3 w-3" />
                {report.todayCount}
              </span>
              {report.blockerCount > 0 && (
                <span className="flex items-center gap-1 rounded-md bg-warning/10 px-2 py-0.5 text-xs text-warning">
                  <AlertTriangle className="h-3 w-3" />
                  {report.blockerCount}
                </span>
              )}
              {(report.reactionCount ?? 0) > 0 && (
                <span className="flex items-center gap-1 rounded-md bg-accent px-2 py-0.5 text-xs text-accent-foreground">
                  <SmilePlus className="h-3 w-3" />
                  {report.reactionCount}
                </span>
              )}
              {(report.commentCount ?? 0) > 0 && (
                <span className="flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                  <MessageSquare className="h-3 w-3" />
                  {report.commentCount}
                </span>
              )}
            </div>
          ) : (
            <p className="mt-1 text-sm text-muted-foreground italic">No report submitted</p>
          )}
        </div>
      </div>
    </Link>
  );
}
