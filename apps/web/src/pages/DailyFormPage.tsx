import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Save, Calendar, Loader2 } from "lucide-react";
import {
  useDailyReport,
  useCreateDailyReport,
  useUpdateDailyReport,
  type DailyReportInput,
  type CompletedItem,
  type TodayItem,
  type Blocker,
} from "@/hooks/useDailyReport";
import { CompletedSection } from "@/components/daily-form/CompletedSection";
import { TodaySection } from "@/components/daily-form/TodaySection";
import { BlockersSection } from "@/components/daily-form/BlockersSection";
import { cn } from "@/lib/utils";

export function DailyFormPage() {
  const { date: dateParam } = useParams();
  const navigate = useNavigate();
  const date = dateParam ?? format(new Date(), "yyyy-MM-dd");

  const { data: existing, isLoading } = useDailyReport(date);
  const createMutation = useCreateDailyReport();
  const updateMutation = useUpdateDailyReport();

  const [completedItems, setCompletedItems] = useState<CompletedItem[]>([]);
  const [todayItems, setTodayItems] = useState<TodayItem[]>([
    { priority: "PRIMARY", title: "" },
  ]);
  const [blockers, setBlockers] = useState<Blocker[]>([]);
  const [questions, setQuestions] = useState<
    { type: "TECHNICAL" | "PRODUCT" | "PROCESS"; content: string }[]
  >([]);
  const [testedTickets, setTestedTickets] = useState<
    { ticketId: string; title: string; result: "APPROVED" | "REJECTED" }[]
  >([]);
  const [notes, setNotes] = useState({
    codeReviewRequests: "",
    testingStatus: "",
    deploymentNotes: "",
    learningResearch: "",
  });

  useEffect(() => {
    if (existing) {
      setCompletedItems(existing.completedItems ?? []);
      setTodayItems(
        existing.todayItems?.length
          ? existing.todayItems
          : [{ priority: "PRIMARY" as const, title: "" }],
      );
      setBlockers(existing.blockers ?? []);
      setQuestions(existing.questions ?? []);
      setTestedTickets(existing.testedTickets ?? []);
      setNotes({
        codeReviewRequests: existing.notes?.codeReviewRequests ?? "",
        testingStatus: existing.notes?.testingStatus ?? "",
        deploymentNotes: existing.notes?.deploymentNotes ?? "",
        learningResearch: existing.notes?.learningResearch ?? "",
      });
    }
  }, [existing]);

  const isSaving = createMutation.isPending || updateMutation.isPending;

  async function handleSave() {
    const input: DailyReportInput = {
      date,
      completedItems,
      todayItems: todayItems.filter((t) => t.title.trim()),
      blockers: blockers.filter((b) => b.description.trim()),
      questions: questions.filter((q) => q.content.trim()),
      testedTickets: testedTickets.filter((t) => t.ticketId.trim()),
      notes,
    };

    if (existing) {
      await updateMutation.mutateAsync({ id: existing.id, ...input });
    } else {
      await createMutation.mutateAsync(input);
    }

    navigate("/");
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Daily Report</h1>
          <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <input
              type="date"
              value={date}
              onChange={(e) => navigate(`/daily/${e.target.value}`)}
              className="border-none bg-transparent text-sm outline-none"
            />
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className={cn(
            "flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
            isSaving && "cursor-not-allowed opacity-60",
          )}
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {existing ? "Update" : "Save"}
        </button>
      </div>

      <CompletedSection items={completedItems} onChange={setCompletedItems} />
      <TodaySection items={todayItems} onChange={setTodayItems} />
      <BlockersSection items={blockers} onChange={setBlockers} />

      {/* Notes Section */}
      <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Additional Notes</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Code Review Requests
            </label>
            <textarea
              value={notes.codeReviewRequests}
              onChange={(e) =>
                setNotes((n) => ({
                  ...n,
                  codeReviewRequests: e.target.value,
                }))
              }
              rows={3}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
              placeholder="PRs that need review..."
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Testing Status
            </label>
            <textarea
              value={notes.testingStatus}
              onChange={(e) =>
                setNotes((n) => ({ ...n, testingStatus: e.target.value }))
              }
              rows={3}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
              placeholder="Testing progress..."
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Deployment Notes
            </label>
            <textarea
              value={notes.deploymentNotes}
              onChange={(e) =>
                setNotes((n) => ({ ...n, deploymentNotes: e.target.value }))
              }
              rows={3}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
              placeholder="Deployment-related notes..."
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Learning / Research
            </label>
            <textarea
              value={notes.learningResearch}
              onChange={(e) =>
                setNotes((n) => ({ ...n, learningResearch: e.target.value }))
              }
              rows={3}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
              placeholder="Anything learned or researched..."
            />
          </div>
        </div>
      </section>

      {/* Questions Section */}
      <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Questions</h2>
          <button
            onClick={() =>
              setQuestions((q) => [
                ...q,
                { type: "TECHNICAL", content: "" },
              ])
            }
            className="text-sm font-medium text-primary hover:underline"
          >
            + Add question
          </button>
        </div>

        {questions.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No questions — click "Add question" if you have any.
          </p>
        ) : (
          <div className="space-y-3">
            {questions.map((q, i) => (
              <div key={i} className="flex gap-3">
                <select
                  value={q.type}
                  onChange={(e) => {
                    const updated = [...questions];
                    updated[i] = {
                      type: e.target.value as typeof q.type,
                      content: updated[i]!.content,
                    };
                    setQuestions(updated);
                  }}
                  className="rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
                >
                  <option value="TECHNICAL">Technical</option>
                  <option value="PRODUCT">Product</option>
                  <option value="PROCESS">Process</option>
                </select>
                <input
                  value={q.content}
                  onChange={(e) => {
                    const updated = [...questions];
                    updated[i] = { type: updated[i]!.type, content: e.target.value };
                    setQuestions(updated);
                  }}
                  className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
                  placeholder="Your question..."
                />
                <button
                  onClick={() => setQuestions((q) => q.filter((_, j) => j !== i))}
                  className="text-sm text-muted-foreground hover:text-destructive"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Tested Tickets Section */}
      <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Tested Tickets</h2>
          <button
            onClick={() =>
              setTestedTickets((t) => [
                ...t,
                { ticketId: "", title: "", result: "APPROVED" },
              ])
            }
            className="text-sm font-medium text-primary hover:underline"
          >
            + Add ticket
          </button>
        </div>

        {testedTickets.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No tested tickets — click "Add ticket" to add one.
          </p>
        ) : (
          <div className="space-y-3">
            {testedTickets.map((t, i) => (
              <div key={i} className="flex gap-3">
                <input
                  value={t.ticketId}
                  onChange={(e) => {
                    const updated = [...testedTickets];
                    updated[i] = { ticketId: e.target.value, title: updated[i]!.title, result: updated[i]!.result };
                    setTestedTickets(updated);
                  }}
                  className="w-32 rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
                  placeholder="Ticket ID"
                />
                <input
                  value={t.title}
                  onChange={(e) => {
                    const updated = [...testedTickets];
                    updated[i] = { ticketId: updated[i]!.ticketId, title: e.target.value, result: updated[i]!.result };
                    setTestedTickets(updated);
                  }}
                  className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
                  placeholder="Ticket title"
                />
                <select
                  value={t.result}
                  onChange={(e) => {
                    const updated = [...testedTickets];
                    updated[i] = {
                      ticketId: updated[i]!.ticketId,
                      title: updated[i]!.title,
                      result: e.target.value as typeof t.result,
                    };
                    setTestedTickets(updated);
                  }}
                  className="rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
                >
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                </select>
                <button
                  onClick={() =>
                    setTestedTickets((t) => t.filter((_, j) => j !== i))
                  }
                  className="text-sm text-muted-foreground hover:text-destructive"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
