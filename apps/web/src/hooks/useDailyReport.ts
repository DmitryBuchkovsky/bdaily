import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface CompletedItem {
  id?: string;
  type: "TASK" | "BUG_FIX";
  ticketId?: string;
  title: string;
  details?: string;
  status: "COMPLETED" | "MERGED" | "DEPLOYED";
  prLink?: string;
  commitHash?: string;
  rootCause?: string;
  solution?: string;
  impact?: string;
}

export interface TodayItem {
  id?: string;
  priority: "PRIMARY" | "SECONDARY";
  ticketId?: string;
  title: string;
  goal?: string;
  approach?: string;
  etaToDev?: string;
}

export interface Blocker {
  id?: string;
  type: "TECHNICAL" | "DEPENDENCY";
  description: string;
  impact?: string;
  need?: string;
  waitingFor?: string;
  expectedResolution?: string;
}

export interface Question {
  id?: string;
  type: "TECHNICAL" | "PRODUCT" | "PROCESS";
  content: string;
}

export interface TestedTicket {
  id?: string;
  ticketId: string;
  title: string;
  result: "APPROVED" | "REJECTED";
}

export interface Notes {
  codeReviewRequests?: string;
  testingStatus?: string;
  deploymentNotes?: string;
  learningResearch?: string;
}

export interface DailyReport {
  id: string;
  userId: string;
  date: string;
  completedItems: CompletedItem[];
  todayItems: TodayItem[];
  blockers: Blocker[];
  questions: Question[];
  testedTickets: TestedTicket[];
  notes?: Notes;
  createdAt: string;
  updatedAt: string;
}

export interface DailyReportInput {
  date: string;
  completedItems: CompletedItem[];
  todayItems: TodayItem[];
  blockers: Blocker[];
  questions: Question[];
  testedTickets: TestedTicket[];
  notes?: Notes;
}

interface DailyHistoryResponse {
  reports: DailyReport[];
  total: number;
  page: number;
  limit: number;
}

export function useDailyReport(date: string | undefined) {
  return useQuery({
    queryKey: ["daily-report", date],
    queryFn: () => api.get<DailyReport>(`/daily/${date}`),
    enabled: !!date,
  });
}

export function useDailyReportHistory(page = 1, limit = 10) {
  return useQuery({
    queryKey: ["daily-reports", page, limit],
    queryFn: () =>
      api.get<DailyHistoryResponse>(
        `/daily/history?page=${page}&limit=${limit}`,
      ),
  });
}

export function useCreateDailyReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: DailyReportInput) =>
      api.post<DailyReport>("/daily", input),
    onSuccess: (data) => {
      qc.setQueryData(["daily-report", data.date], data);
      qc.invalidateQueries({ queryKey: ["daily-reports"] });
    },
  });
}

export function useUpdateDailyReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: DailyReportInput & { id: string }) =>
      api.put<DailyReport>(`/daily/${id}`, input),
    onSuccess: (data) => {
      qc.setQueryData(["daily-report", data.date], data);
      qc.invalidateQueries({ queryKey: ["daily-reports"] });
    },
  });
}
