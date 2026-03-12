import { useState } from "react";
import { format } from "date-fns";
import { Calendar } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useTeamSummary } from "@/hooks/useSummary";
import { MemberDailyCard } from "@/components/team/MemberDailyCard";

export function TeamDashboardPage() {
  const { user } = useAuth();
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const { data: teamDailies, isLoading } = useTeamSummary(user?.teamId, date, date);
  const [expandedMember, setExpandedMember] = useState<string | null>(null);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Team Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">See what everyone's working on</p>
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
          <p className="text-muted-foreground">No team data available for this date.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {teamDailies.map((member) => (
            <MemberDailyCard
              key={member.userId}
              member={member}
              expanded={expandedMember === member.userId}
              onToggle={() => setExpandedMember(expandedMember === member.userId ? null : member.userId)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
