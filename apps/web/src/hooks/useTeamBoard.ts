import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface BoardReportSummary {
  id: string;
  date: string;
  completedCount: number;
  todayCount: number;
  blockerCount: number;
  questionCount: number;
  reactionCount?: number;
  commentCount?: number;
}

export interface BoardMemberEntry {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    avatarUrl?: string | null;
  };
  hasReport: boolean;
  report: BoardReportSummary | null;
}

export interface MemberReport {
  id: string;
  date: string;
  completedItems: unknown[];
  todayItems: unknown[];
  blockers: unknown[];
  notes?: unknown;
  questions: unknown[];
  testedTickets: unknown[];
  [key: string]: unknown;
}

export interface MemberReportsResponse {
  user: { id: string; name: string; avatarUrl?: string | null } | null;
  reports: MemberReport[];
  total: number;
}

export function useTeamBoard(date?: string) {
  const dateParam = date ?? new Date().toISOString().slice(0, 10);
  return useQuery({
    queryKey: ["board", dateParam],
    queryFn: () => api.get<BoardMemberEntry[]>(`/board?date=${dateParam}`),
  });
}

export interface FullBoardEntry {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    avatarUrl?: string | null;
  };
  hasReport: boolean;
  report: MemberReport | null;
}

export function useTeamBoardFull(date?: string) {
  const dateParam = date ?? new Date().toISOString().slice(0, 10);
  return useQuery({
    queryKey: ["board-full", dateParam],
    queryFn: () => api.get<FullBoardEntry[]>(`/board/full?date=${dateParam}`),
  });
}

export function useMemberReports(userId: string | undefined, page = 1) {
  return useQuery({
    queryKey: ["board", userId, page],
    queryFn: () => api.get<MemberReportsResponse>(`/board/${userId}?page=${page}`),
    enabled: !!userId,
  });
}

export interface MemberReportDetailResponse {
  user: { id: string; name: string; avatarUrl?: string | null } | null;
  report: MemberReport;
}

export function useMemberReport(userId: string | undefined, date: string | undefined) {
  return useQuery({
    queryKey: ["board", userId, date],
    queryFn: () => api.get<MemberReportDetailResponse>(`/board/${userId}/${date}`),
    enabled: !!userId && !!date,
  });
}
