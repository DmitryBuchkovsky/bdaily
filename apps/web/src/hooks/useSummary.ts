import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface PersonSummary {
  userId: string;
  userName: string;
  period: { from: string; to: string };
  stats: {
    tasksCompleted: number;
    bugsFixed: number;
    ticketsTested: number;
    blockersRaised: number;
    dailiesFiled: number;
    prCount: number;
  };
  completedItems: {
    id: string;
    title: string;
    type: string;
    ticketId?: string;
    date: string;
  }[];
  blockers: {
    id: string;
    description: string;
    type: string;
    date: string;
    resolved: boolean;
  }[];
}

export interface SprintSummary {
  sprintId: string;
  sprintName: string;
  period: { from: string; to: string };
  stats: {
    totalStories: number;
    completedStories: number;
    totalBugs: number;
    resolvedBugs: number;
    activeBlockers: number;
  };
  members: SprintMember[];
}

export interface SprintMember {
  userId: string;
  name: string;
  tasksCompleted: number;
  bugsFixed: number;
  blockersRaised: number;
  dailiesFiled: number;
}

export interface TeamMemberDaily {
  userId: string;
  userName: string;
  avatarUrl?: string;
  hasDailyReport: boolean;
  completedCount: number;
  todayCount: number;
  blockerCount: number;
  completedItems: { title: string; ticketId?: string }[];
  todayItems: { title: string; ticketId?: string }[];
  blockers: { description: string; type: string }[];
}

interface PersonSummaryParams {
  from?: string;
  to?: string;
}

export function usePersonSummary(
  userId: string | undefined,
  params?: PersonSummaryParams,
) {
  const qs = params
    ? `?${new URLSearchParams(params as Record<string, string>).toString()}`
    : "";
  return useQuery({
    queryKey: ["summary", "person", userId, params],
    queryFn: () => api.get<PersonSummary>(`/summary/person/${userId}${qs}`),
    enabled: !!userId,
  });
}

export function useSprintSummary(sprintId: string | undefined) {
  return useQuery({
    queryKey: ["summary", "sprint", sprintId],
    queryFn: () => api.get<SprintSummary>(`/summary/sprint/${sprintId}`),
    enabled: !!sprintId,
  });
}

export function useTeamSummary(
  teamId: string | undefined,
  from?: string,
  to?: string,
) {
  const params = new URLSearchParams();
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  const qs = params.toString() ? `?${params.toString()}` : "";
  return useQuery({
    queryKey: ["summary", "team", teamId, from, to],
    queryFn: () =>
      api.get<TeamMemberDaily[]>(`/summary/team/${teamId}${qs}`),
    enabled: !!teamId,
  });
}
