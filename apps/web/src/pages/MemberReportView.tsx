import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { useMemberReports } from "@/hooks/useTeamBoard";
import { MemberReportCard } from "@/components/board/MemberReportCard";
import { PageInfoBlock } from "@/components/ui/PageInfoBlock";

export function MemberReportView() {
  const { userId } = useParams<{ userId: string }>();
  const [page, setPage] = useState(1);
  const { data, isLoading } = useMemberReports(userId, page);

  if (isLoading || !data) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const { user, reports, total } = data;
  const limit = 10;
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        to="/board"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" /> Back to board
      </Link>

      <h1 className="text-2xl font-bold">{user?.name ?? "Member"}&apos;s reports</h1>

      <PageInfoBlock
        storageKey="member-reports"
        title="Report History"
        description="Browse all daily standup reports for this team member. Click on any report to view the full details, leave reactions, or add comments and follow-up questions."
      />

      <div className="space-y-2">
        {reports.map((report) => (
          <MemberReportCard
            key={report.id}
            report={report as Parameters<typeof MemberReportCard>[0]["report"]}
            userId={userId!}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="rounded-lg border px-3 py-1 text-sm disabled:opacity-50"
          >
            Previous
          </button>
          <span className="py-1 text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="rounded-lg border px-3 py-1 text-sm disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
