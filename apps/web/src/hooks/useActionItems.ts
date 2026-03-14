import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface ActionItem {
  id: string;
  [key: string]: unknown;
}

export interface CreateActionItemInput {
  [key: string]: unknown;
}

export interface UpdateActionItemInput {
  [key: string]: unknown;
}

export function useMyActionItems(status?: string) {
  const params = status ? `?status=${encodeURIComponent(status)}` : "";
  return useQuery({
    queryKey: ["action-items", "mine", status],
    queryFn: () => api.get<ActionItem[]>(`/action-items${params}`),
  });
}

export function useTeamActionItems(status?: string) {
  const params = status ? `?status=${encodeURIComponent(status)}` : "";
  return useQuery({
    queryKey: ["action-items", "team", status],
    queryFn: () => api.get<ActionItem[]>(`/action-items/team${params}`),
  });
}

export function usePendingApproval() {
  return useQuery({
    queryKey: ["action-items", "pending-approval"],
    queryFn: () => api.get<ActionItem[]>("/action-items/pending-approval"),
  });
}

export function useCreateActionItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateActionItemInput) => api.post<ActionItem>("/action-items", input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["action-items"] });
    },
  });
}

export function useUpdateActionItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: UpdateActionItemInput & { id: string }) =>
      api.put<ActionItem>(`/action-items/${id}`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["action-items"] });
    },
  });
}

export function useRequestDone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.put<ActionItem>(`/action-items/${id}/request-done`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["action-items"] });
    },
  });
}

export function useApproveActionItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.put<ActionItem>(`/action-items/${id}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["action-items"] });
    },
  });
}

export function useRejectActionItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.put<ActionItem>(`/action-items/${id}/reject`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["action-items"] });
    },
  });
}

export function useDeleteActionItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<void>(`/action-items/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["action-items"] });
    },
  });
}
