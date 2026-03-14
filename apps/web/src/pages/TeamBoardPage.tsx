import { useState } from "react";
import { format } from "date-fns";
import { Calendar } from "lucide-react";
import { useTeamBoard } from "@/hooks/useTeamBoard";
import { ReportCard } from "@/components/board/ReportCard";
import { PageInfoBlock } from "@/components/ui/PageInfoBlock";

export function TeamBoardPage() {
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const { data: entries, isLoading } = useTeamBoard(date);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Team Board</h1>
        <div className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border-none bg-transparent text-sm outline-none"
          />
        </div>
      </div>

      <PageInfoBlock
        storageKey="team-board"
        title="Team Board"
        description="See everyone's daily report status at a glance. Click on a team member to view their report history, or click a specific report to read the full details, react with emojis, and leave comments or questions for the standup."
        tips={[
          "Green badge = completed items, Blue = today's plan, Orange = blockers",
          "Emoji and comment counts show engagement on each report",
          "Use the date picker to view reports for any past day",
        ]}
      />

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {entries?.map((entry) => (
            <ReportCard
              key={entry.user.id}
              user={entry.user}
              hasReport={entry.hasReport}
              report={entry.report}
            />
          ))}
        </div>
      )}
    </div>
  );
}
