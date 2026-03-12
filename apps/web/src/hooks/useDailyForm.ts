import { useState, useEffect, useCallback } from "react";
import {
  useDailyReport,
  useCreateDailyReport,
  useUpdateDailyReport,
  type CompletedItem,
  type TodayItem,
  type Blocker,
  type Question,
  type TestedTicket,
  type Notes,
  type DailyReportInput,
} from "./useDailyReport";

interface UseDailyFormReturn {
  isLoading: boolean;
  isSaving: boolean;
  completedItems: CompletedItem[];
  setCompletedItems: (items: CompletedItem[]) => void;
  todayItems: TodayItem[];
  setTodayItems: (items: TodayItem[]) => void;
  blockers: Blocker[];
  setBlockers: (items: Blocker[]) => void;
  questions: Question[];
  setQuestions: (items: Question[]) => void;
  testedTickets: TestedTicket[];
  setTestedTickets: (items: TestedTicket[]) => void;
  notes: Notes;
  setNotes: (notes: Notes) => void;
  handleSave: () => Promise<void>;
  isExisting: boolean;
}

const defaultNotes: Notes = {
  codeReviewRequests: "",
  testingStatus: "",
  deploymentNotes: "",
  learningResearch: "",
};

export function useDailyForm(date: string): UseDailyFormReturn {
  const { data: existing, isLoading } = useDailyReport(date);
  const createMutation = useCreateDailyReport();
  const updateMutation = useUpdateDailyReport();

  const [completedItems, setCompletedItems] = useState<CompletedItem[]>([]);
  const [todayItems, setTodayItems] = useState<TodayItem[]>([
    { priority: "PRIMARY", title: "" },
  ]);
  const [blockers, setBlockers] = useState<Blocker[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [testedTickets, setTestedTickets] = useState<TestedTicket[]>([]);
  const [notes, setNotes] = useState<Notes>({ ...defaultNotes });

  useEffect(() => {
    if (!existing) return;
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
  }, [existing]);

  const handleSave = useCallback(async () => {
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
  }, [
    date, completedItems, todayItems, blockers, questions,
    testedTickets, notes, existing, createMutation, updateMutation,
  ]);

  return {
    isLoading,
    isSaving: createMutation.isPending || updateMutation.isPending,
    completedItems,
    setCompletedItems,
    todayItems,
    setTodayItems,
    blockers,
    setBlockers,
    questions,
    setQuestions,
    testedTickets,
    setTestedTickets,
    notes,
    setNotes,
    handleSave,
    isExisting: !!existing,
  };
}
