import { useState } from "react";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import {
  Calendar,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

interface TeamMemberDaily {
  userId: string;
  userName: string;
  avatarUrl?: string;
  hasDailyReport: boolean;
  completedCount: number;
  todayCount: number;
  blockerCount: number;
  completedItems: { title: string; ticketId?: string }[];
  todayItems: { title: string; ticketId?: string }[];
  blockers: { description: string; type: string }[];
}

export function TeamDashboardPage() {
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));

  const { data: teamDailies, isLoading } = useQuery({
    queryKey: ["team", "dailies", date],
    queryFn: () =>
      api.get<TeamMemberDaily[]>(`/summary/team?date=${date}`),
  });

  const [expandedMember, setExpandedMember] = useState<string | null>(null);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Team Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            See what everyone's working on
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border-none bg-transparent text-sm outline-none"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : !teamDailies?.length ? (
        <div className="rounded-xl border border-border bg-card py-16 text-center shadow-sm">
          <p className="text-muted-foreground">
            No team data available for this date.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {teamDailies.map((member) => (
            <div
              key={member.userId}
              className="rounded-xl border border-border bg-card shadow-sm"
            >
              <button
                onClick={() =>
                  setExpandedMember(
                    expandedMember === member.userId
                      ? null
                      : member.userId,
                  )
                }
                className="flex w-full items-center justify-between px-6 py-4 text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                    {member.userName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium">{member.userName}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      {member.hasDailyReport ? (
                        <>
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3 text-success" />
                            {member.completedCount} done
                          </span>
                          <span>{member.todayCount} planned</span>
                          {member.blockerCount > 0 && (
                            <span className="flex items-center gap-1 text-warning">
                              <AlertTriangle className="h-3 w-3" />
                              {member.blockerCount} blocked
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="italic">No report filed</span>
                      )}
                    </div>
                  </div>
                </div>
                <ChevronRight
                  className={cn(
                    "h-4 w-4 text-muted-foreground transition-transform",
                    expandedMember === member.userId && "rotate-90",
                  )}
                />
              </button>

              {expandedMember === member.userId && member.hasDailyReport && (
                <div className="border-t border-border px-6 py-4">
                  <div className="grid gap-6 md:grid-cols-3">
                    <div>
                      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Completed
                      </h3>
                      {member.completedItems.length === 0 ? (
                        <p className="text-sm text-muted-foreground">None</p>
                      ) : (
                        <ul className="space-y-1">
                          {member.completedItems.map((item, i) => (
                            <li key={i} className="text-sm">
                              {item.ticketId && (
                                <span className="mr-1.5 font-mono text-xs text-primary">
                                  {item.ticketId}
                                </span>
                              )}
                              {item.title}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div>
                      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Today
                      </h3>
                      {member.todayItems.length === 0 ? (
                        <p className="text-sm text-muted-foreground">None</p>
                      ) : (
                        <ul className="space-y-1">
                          {member.todayItems.map((item, i) => (
                            <li key={i} className="text-sm">
                              {item.ticketId && (
                                <span className="mr-1.5 font-mono text-xs text-primary">
                                  {item.ticketId}
                                </span>
                              )}
                              {item.title}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div>
                      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Blockers
                      </h3>
                      {member.blockers.length === 0 ? (
                        <p className="text-sm text-muted-foreground">None</p>
                      ) : (
                        <ul className="space-y-1">
                          {member.blockers.map((blocker, i) => (
                            <li key={i} className="text-sm">
                              <span className="mr-1.5 rounded bg-warning/10 px-1 py-0.5 text-xs text-warning">
                                {blocker.type}
                              </span>
                              {blocker.description}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
