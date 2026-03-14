import { useState } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  ListTodo,
  AlertTriangle,
  HelpCircle,
  FileText,
  ExternalLink,
} from "lucide-react";
import { useTeamBoardFull, type FullBoardEntry } from "@/hooks/useTeamBoard";
import { RichContent } from "@/components/ui/RichContent";
import { PageInfoBlock } from "@/components/ui/PageInfoBlock";
import { cn } from "@/lib/utils";

export function TeamDailyPage() {
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const { data: entries, isLoading } = useTeamBoardFull(date);

  const shiftDate = (days: number) => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    setDate(format(d, "yyyy-MM-dd"));
  };

  const submitted = entries?.filter((e) => e.hasReport) ?? [];
  const missing = entries?.filter((e) => !e.hasReport) ?? [];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Team Daily Report</h1>
        <div className="flex items-center gap-1">
          <button
            onClick={() => shiftDate(-1)}
            className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border-none bg-transparent text-sm outline-none"
            />
          </div>
          <button
            onClick={() => shiftDate(1)}
            className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <PageInfoBlock
        storageKey="team-daily-report"
        title="Team Daily Report"
        description="A consolidated view of all team members' daily reports for the selected date. Read everything in one page instead of clicking into each person individually."
        tips={[
          "Scroll through all reports — each member's full report is shown inline",
          "Members who haven't submitted are listed at the bottom",
          "Click a member's name to view their full report history",
          "Use the arrows or date picker to navigate between days",
        ]}
      />

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : (
        <>
          {entries && (
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-success" />
                {submitted.length} submitted
              </span>
              {missing.length > 0 && (
                <span className="flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4 text-warning" />
                  {missing.length} missing
                </span>
              )}
            </div>
          )}

          <div className="space-y-6">
            {submitted.map((entry) => (
              <MemberFullReport key={entry.user.id} entry={entry} date={date} />
            ))}
          </div>

          {missing.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="mb-3 text-sm font-semibold text-muted-foreground">
                No report submitted
              </h3>
              <div className="flex flex-wrap gap-2">
                {missing.map((entry) => (
                  <span
                    key={entry.user.id}
                    className="rounded-lg bg-warning/10 px-3 py-1.5 text-sm text-warning"
                  >
                    {entry.user.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

interface ReportItem {
  title?: string;
  details?: string;
  description?: string;
  content?: string;
  ticketId?: string;
  type?: string;
  result?: string;
  status?: string;
  priority?: string;
  goal?: string;
  approach?: string;
  impact?: string;
  need?: string;
  waitingFor?: string;
  rootCause?: string;
  solution?: string;
  prLink?: string;
  [key: string]: unknown;
}

function MemberFullReport({ entry, date }: { entry: FullBoardEntry; date: string }) {
  const { user, report } = entry;
  if (!report) return null;

  const initial = user.name.charAt(0).toUpperCase();
  const completed = (report.completedItems ?? []) as ReportItem[];
  const today = (report.todayItems ?? []) as ReportItem[];
  const blockers = (report.blockers ?? []) as ReportItem[];
  const questions = (report.questions ?? []) as ReportItem[];
  const tested = (report.testedTickets ?? []) as ReportItem[];
  const notes = report.notes as Record<string, unknown> | null;

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between border-b border-border bg-muted/30 px-5 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
            {initial}
          </div>
          <div>
            <Link
              to={`/board/${user.id}`}
              className="font-semibold hover:text-primary hover:underline"
            >
              {user.name}
            </Link>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <Link
          to={`/board/${user.id}/${date}`}
          className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          Full view <ExternalLink className="h-3 w-3" />
        </Link>
      </div>

      <div className="space-y-4 p-5">
        {completed.length > 0 && (
          <Section icon={CheckCircle2} title="Completed" color="text-success">
            {completed.map((item, i) => (
              <ItemCard key={i}>
                <div className="flex items-start gap-2">
                  {item.ticketId && <TicketBadge id={item.ticketId} />}
                  <span className="font-medium">{item.title}</span>
                  {item.status && <StatusBadge status={item.status} />}
                </div>
                {item.details && (
                  <RichContent html={item.details} className="mt-1 text-sm text-muted-foreground" />
                )}
                {item.type === "BUG_FIX" && item.rootCause && (
                  <div className="mt-2 space-y-1 rounded-lg bg-muted/50 p-2 text-xs">
                    {item.rootCause && (
                      <div>
                        <strong>Root cause:</strong>{" "}
                        <RichContent html={item.rootCause} className="inline" />
                      </div>
                    )}
                    {item.solution && (
                      <div>
                        <strong>Solution:</strong>{" "}
                        <RichContent html={item.solution} className="inline" />
                      </div>
                    )}
                    {item.impact && (
                      <div>
                        <strong>Impact:</strong>{" "}
                        <RichContent html={item.impact} className="inline" />
                      </div>
                    )}
                  </div>
                )}
                {item.prLink && (
                  <a
                    href={item.prLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-block text-xs text-primary hover:underline"
                  >
                    PR link
                  </a>
                )}
              </ItemCard>
            ))}
          </Section>
        )}

        {today.length > 0 && (
          <Section icon={ListTodo} title="Today's Plan" color="text-primary">
            {today.map((item, i) => (
              <ItemCard key={i}>
                <div className="flex items-start gap-2">
                  {item.ticketId && <TicketBadge id={item.ticketId} />}
                  <span className="font-medium">{item.title}</span>
                  {item.priority && (
                    <span
                      className={cn(
                        "rounded px-1.5 py-0.5 text-xs",
                        item.priority === "PRIMARY"
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {item.priority}
                    </span>
                  )}
                </div>
                {item.goal && (
                  <RichContent
                    html={typeof item.goal === "string" ? item.goal : String(item.goal)}
                    className="mt-1 text-sm text-muted-foreground"
                  />
                )}
                {item.approach && (
                  <RichContent
                    html={typeof item.approach === "string" ? item.approach : String(item.approach)}
                    className="mt-1 text-xs text-muted-foreground italic"
                  />
                )}
              </ItemCard>
            ))}
          </Section>
        )}

        {blockers.length > 0 && (
          <Section icon={AlertTriangle} title="Blockers" color="text-warning">
            {blockers.map((item, i) => (
              <ItemCard key={i}>
                {item.type && (
                  <span className="mb-1 inline-block rounded bg-warning/10 px-1.5 py-0.5 text-xs text-warning">
                    {item.type}
                  </span>
                )}
                {item.description && (
                  <RichContent
                    html={
                      typeof item.description === "string"
                        ? item.description
                        : String(item.description)
                    }
                    className="text-sm"
                  />
                )}
                {(item.impact || item.need || item.waitingFor) && (
                  <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                    {item.impact && (
                      <div>
                        <strong>Impact:</strong>{" "}
                        <RichContent
                          html={typeof item.impact === "string" ? item.impact : String(item.impact)}
                          className="inline"
                        />
                      </div>
                    )}
                    {item.need && (
                      <div>
                        <strong>Need:</strong>{" "}
                        <RichContent
                          html={typeof item.need === "string" ? item.need : String(item.need)}
                          className="inline"
                        />
                      </div>
                    )}
                    {item.waitingFor && (
                      <div>
                        <strong>Waiting for:</strong> {String(item.waitingFor)}
                      </div>
                    )}
                  </div>
                )}
              </ItemCard>
            ))}
          </Section>
        )}

        {questions.length > 0 && (
          <Section icon={HelpCircle} title="Questions" color="text-info">
            {questions.map((item, i) => (
              <ItemCard key={i}>
                {item.type && (
                  <span className="mb-1 inline-block rounded bg-info/10 px-1.5 py-0.5 text-xs text-info">
                    {item.type}
                  </span>
                )}
                {item.content && (
                  <RichContent
                    html={typeof item.content === "string" ? item.content : String(item.content)}
                    className="text-sm"
                  />
                )}
              </ItemCard>
            ))}
          </Section>
        )}

        {tested.length > 0 && (
          <Section icon={FileText} title="Tested Tickets" color="text-muted-foreground">
            {tested.map((item, i) => (
              <ItemCard key={i}>
                <div className="flex items-center gap-2">
                  <TicketBadge id={item.ticketId ?? ""} />
                  <span className="font-medium">{item.title}</span>
                  {item.result && (
                    <span
                      className={cn(
                        "rounded px-1.5 py-0.5 text-xs",
                        item.result === "APPROVED"
                          ? "bg-success/10 text-success"
                          : "bg-destructive/10 text-destructive",
                      )}
                    >
                      {item.result}
                    </span>
                  )}
                </div>
              </ItemCard>
            ))}
          </Section>
        )}

        {notes && Object.values(notes).some((v) => v != null && v !== "" && v !== "id") && (
          <div className="rounded-lg bg-muted/30 p-3">
            <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Notes</p>
            <div className="space-y-1 text-sm">
              {Object.entries(notes).map(([key, val]) => {
                if (val == null || val === "" || key === "id" || key === "dailyReportId")
                  return null;
                return (
                  <div key={key}>
                    <span className="text-xs font-medium text-muted-foreground">
                      {key.replace(/([A-Z])/g, " $1").trim()}:
                    </span>{" "}
                    <RichContent
                      html={typeof val === "string" ? val : String(val)}
                      className="inline text-sm"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {completed.length === 0 &&
          today.length === 0 &&
          blockers.length === 0 &&
          questions.length === 0 &&
          tested.length === 0 && (
            <p className="text-sm italic text-muted-foreground">
              Empty report — no sections filled.
            </p>
          )}
      </div>
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  color,
  children,
}: {
  icon: typeof CheckCircle2;
  title: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-1.5">
        <Icon className={cn("h-4 w-4", color)} />
        <h4 className="text-xs font-semibold uppercase text-muted-foreground">{title}</h4>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function ItemCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border/50 bg-background p-3 text-sm">{children}</div>
  );
}

function TicketBadge({ id }: { id: string }) {
  return (
    <span className="shrink-0 rounded bg-primary/10 px-1.5 py-0.5 font-mono text-xs text-primary">
      {id}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    COMPLETED: "bg-success/10 text-success",
    MERGED: "bg-primary/10 text-primary",
    DEPLOYED: "bg-info/10 text-info",
  };
  return (
    <span
      className={cn(
        "rounded px-1.5 py-0.5 text-xs",
        colors[status] ?? "bg-muted text-muted-foreground",
      )}
    >
      {status}
    </span>
  );
}
