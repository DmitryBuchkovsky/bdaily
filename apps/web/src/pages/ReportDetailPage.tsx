import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronLeft, Plus } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useMemberReport } from "@/hooks/useTeamBoard";
import { useTeamMembers } from "@/hooks/useAdmin";
import { useCreateActionItem } from "@/hooks/useActionItems";
import { RichContent } from "@/components/ui/RichContent";
import { AssignActionItemModal } from "@/components/action-items/AssignActionItemModal";
import { ReactionBar } from "@/components/board/ReactionBar";
import { CommentSection } from "@/components/board/CommentSection";
import { PageInfoBlock } from "@/components/ui/PageInfoBlock";
import { cn } from "@/lib/utils";

interface ReportItem {
  title?: string;
  details?: string;
  description?: string;
  content?: string;
  ticketId?: string;
  type?: string;
  result?: string;
  [key: string]: unknown;
}

function ReportSection({
  title,
  items,
  renderItem,
}: {
  title: string;
  items: unknown[];
  renderItem: (item: ReportItem) => React.ReactNode;
}) {
  const list = (items ?? []) as ReportItem[];
  if (list.length === 0) return null;
  return (
    <section>
      <h3 className="mb-2 text-sm font-semibold uppercase text-muted-foreground">{title}</h3>
      <ul className="space-y-2">
        {list.map((item, i) => (
          <li key={i} className="rounded-lg border bg-card p-3">
            {renderItem(item) as React.ReactNode}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function ReportDetailPage() {
  const { userId, date } = useParams<{ userId: string; date: string }>();
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const { data, isLoading } = useMemberReport(userId, date);
  const { data: teamData } = useTeamMembers(isAdmin ? user?.teamId : undefined);
  const createActionItem = useCreateActionItem();
  const [showAssign, setShowAssign] = useState(false);

  if (isLoading || !data) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const { user: reportUser, report } = data;
  const teamMembers = (teamData ?? []).map((m) => ({ id: m.id, name: m.name }));

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <Link
        to={userId ? `/board/${userId}` : "/board"}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" /> Back
      </Link>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          {reportUser?.name}&apos;s report — {date}
        </h1>
        {isAdmin && (
          <button
            onClick={() => setShowAssign(true)}
            className={cn(
              "flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium",
              "text-primary-foreground hover:bg-primary/90",
            )}
          >
            <Plus className="h-4 w-4" /> Assign Action Item
          </button>
        )}
      </div>

      <PageInfoBlock
        storageKey="report-detail"
        title="Report Detail"
        description="Read the full daily standup report. React with emojis to acknowledge or encourage, and use comments to ask follow-up questions that can be discussed in the standup meeting."
        tips={[
          "React with emojis to show you've read the report",
          "Add comments or sub-questions that need discussion",
          "Admins can assign action items directly from this view",
          "Comments can be marked as resolved once addressed",
        ]}
      />

      <ReactionBar reportId={report.id} />

      <div className="space-y-6">
        <ReportSection
          title="Completed"
          items={report.completedItems ?? []}
          renderItem={(item) => (
            <>
              {item.ticketId && (
                <span className="mr-2 font-mono text-xs text-primary">{item.ticketId}</span>
              )}
              <span className="font-medium">{item.title}</span>
              {item.details && <RichContent html={item.details} className="mt-1 text-sm" />}
            </>
          )}
        />
        <ReportSection
          title="Today"
          items={report.todayItems ?? []}
          renderItem={(item) => (
            <>
              {item.ticketId && (
                <span className="mr-2 font-mono text-xs text-primary">{item.ticketId}</span>
              )}
              <span className="font-medium">{item.title}</span>
              {item.goal != null && (
                <RichContent
                  html={typeof item.goal === "string" ? item.goal : String(item.goal)}
                  className="mt-1 text-sm"
                />
              )}
            </>
          )}
        />
        <ReportSection
          title="Blockers"
          items={report.blockers ?? []}
          renderItem={(item) => (
            <>
              {item.type && (
                <span className="mr-2 rounded bg-warning/10 px-1.5 py-0.5 text-xs text-warning">
                  {item.type}
                </span>
              )}
              {item.description != null && (
                <RichContent
                  html={
                    typeof item.description === "string"
                      ? item.description
                      : String(item.description)
                  }
                  className="text-sm"
                />
              )}
            </>
          )}
        />
        {Boolean(report.notes && typeof report.notes === "object") && (
          <section>
            <h3 className="mb-2 text-sm font-semibold uppercase text-muted-foreground">Notes</h3>
            <div className="space-y-2 rounded-lg border bg-card p-3">
              {Object.entries(report.notes as Record<string, unknown>).map(([key, val]) => {
                if (val == null || val === "") return null;
                const html = typeof val === "string" ? val : String(val);
                return (
                  <div key={key}>
                    <span className="text-xs font-medium text-muted-foreground">
                      {key.replace(/([A-Z])/g, " $1").trim()}:
                    </span>{" "}
                    <RichContent html={html} className="inline text-sm" />
                  </div>
                );
              })}
            </div>
          </section>
        )}
        <ReportSection
          title="Questions"
          items={report.questions ?? []}
          renderItem={(item) => {
            const html =
              typeof item.content === "string"
                ? item.content
                : item.content != null
                  ? String(item.content)
                  : "";
            return html ? <RichContent html={html} className="text-sm" /> : <span>{html}</span>;
          }}
        />
        <ReportSection
          title="Tested"
          items={report.testedTickets ?? []}
          renderItem={(item) => (
            <>
              <span className="font-mono text-xs text-primary">{item.ticketId}</span>
              <span className="ml-2 font-medium">{item.title}</span>
              {item.result && (
                <span className="ml-2 text-xs text-muted-foreground">{item.result}</span>
              )}
            </>
          )}
        />
      </div>

      <CommentSection reportId={report.id} />

      {showAssign && (
        <AssignActionItemModal
          open={showAssign}
          onClose={() => setShowAssign(false)}
          teamMembers={teamMembers}
          dailyReportId={report.id}
          onSubmit={(data) =>
            createActionItem.mutate(
              data as unknown as Parameters<typeof createActionItem.mutate>[0],
              {
                onSuccess: () => setShowAssign(false),
              },
            )
          }
        />
      )}
    </div>
  );
}
