import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface ReactionGroup {
  emoji: string;
  count: number;
  users: { id: string; name: string }[];
  currentUserReacted: boolean;
}

export interface ReportComment {
  id: string;
  dailyReportId: string;
  userId: string;
  user: { id: string; name: string; avatarUrl: string | null };
  content: string;
  parentId: string | null;
  resolved: boolean;
  replies?: ReportComment[];
  createdAt: string;
  updatedAt: string;
}

export function useReactions(reportId: string | undefined) {
  return useQuery({
    queryKey: ["reactions", reportId],
    queryFn: () => api.get<ReactionGroup[]>(`/reports/${reportId}/reactions`),
    enabled: !!reportId,
  });
}

export function useToggleReaction(reportId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (emoji: string) =>
      api.post<{ added: boolean; reactions: ReactionGroup[] }>(`/reports/${reportId}/reactions`, {
        emoji,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reactions", reportId] });
      queryClient.invalidateQueries({ queryKey: ["board"] });
    },
  });
}

export function useComments(reportId: string | undefined) {
  return useQuery({
    queryKey: ["comments", reportId],
    queryFn: () => api.get<ReportComment[]>(`/reports/${reportId}/comments`),
    enabled: !!reportId,
  });
}

export function useAddComment(reportId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { content: string; parentId?: string }) =>
      api.post<ReportComment>(`/reports/${reportId}/comments`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", reportId] });
      queryClient.invalidateQueries({ queryKey: ["board"] });
    },
  });
}

export function useResolveComment(reportId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ commentId, resolved }: { commentId: string; resolved: boolean }) =>
      api.put<ReportComment>(`/reports/comments/${commentId}/resolve`, { resolved }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", reportId] });
    },
  });
}

export function useDeleteComment(reportId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (commentId: string) => api.delete<void>(`/reports/comments/${commentId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", reportId] });
      queryClient.invalidateQueries({ queryKey: ["board"] });
    },
  });
}
