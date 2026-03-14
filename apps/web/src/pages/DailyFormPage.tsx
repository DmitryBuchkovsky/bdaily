import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { useDailyForm } from "@/hooks/useDailyForm";
import { DailyFormHeader } from "@/components/daily-form/DailyFormHeader";
import { CompletedSection } from "@/components/daily-form/CompletedSection";
import { TodaySection } from "@/components/daily-form/TodaySection";
import { BlockersSection } from "@/components/daily-form/BlockersSection";
import { NotesSection } from "@/components/daily-form/NotesSection";
import { QuestionsSection } from "@/components/daily-form/QuestionsSection";
import { TestedTicketsSection } from "@/components/daily-form/TestedTicketsSection";
import { PageInfoBlock } from "@/components/ui/PageInfoBlock";

export function DailyFormPage() {
  const { date: dateParam } = useParams();
  const navigate = useNavigate();
  const date = dateParam ?? format(new Date(), "yyyy-MM-dd");
  const form = useDailyForm(date);

  if (form.isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  async function handleSave() {
    await form.handleSave();
    navigate("/");
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-20">
      <PageInfoBlock
        storageKey="daily-form"
        title="Daily Standup Report"
        description="Fill in each section to share what you accomplished, what you're working on today, and anything blocking your progress. Your team and PM will see this on the Team Board."
        tips={[
          "Completed — what you finished since last standup (tasks, bug fixes)",
          "Today — what you plan to work on, with ticket IDs if applicable",
          "Blockers — anything preventing you from making progress",
          "Notes & Questions — code reviews, deployment notes, or questions for the team",
          "You can use @mentions in rich-text fields to tag teammates",
        ]}
      />
      <DailyFormHeader
        date={date}
        isExisting={form.isExisting}
        isSaving={form.isSaving}
        onSave={handleSave}
        onDateChange={(d) => navigate(`/daily/${d}`)}
      />
      <CompletedSection items={form.completedItems} onChange={form.setCompletedItems} />
      <TodaySection items={form.todayItems} onChange={form.setTodayItems} />
      <BlockersSection items={form.blockers} onChange={form.setBlockers} />
      <NotesSection notes={form.notes} onChange={form.setNotes} />
      <QuestionsSection items={form.questions} onChange={form.setQuestions} />
      <TestedTicketsSection items={form.testedTickets} onChange={form.setTestedTickets} />
    </div>
  );
}
