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
