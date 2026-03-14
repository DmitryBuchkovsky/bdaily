import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface TeamResponse {
  id: string;
  name: string;
  ticketSystemType: string;
  ticketSystemConfig: { baseUrl: string; projectIds: string[]; token?: string };
  themeConfig: Record<string, unknown> | null;
  logoPath: string | null;
  faviconPath: string | null;
  memberCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface TeamMember {
  id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export interface TeamDetail extends TeamResponse {
  members: TeamMember[];
}

export interface CreateTeamInput {
  name: string;
  ticketSystemType: string;
  ticketSystemConfig: { baseUrl: string; projectIds: string[]; token?: string };
}

export interface UpdateTeamInput {
  name?: string;
  ticketSystemType?: string;
  ticketSystemConfig?: { baseUrl: string; projectIds: string[]; token?: string };
}

export interface AddMemberInput {
  email: string;
  name: string;
  password: string;
  role: string;
}

export interface UpdateMemberInput {
  role?: string;
}

export function useTeams() {
  return useQuery({
    queryKey: ["teams"],
    queryFn: () => api.get<TeamResponse[]>("/admin/teams"),
  });
}

export function useTeam(id: string | undefined) {
  return useQuery({
    queryKey: ["teams", id],
    queryFn: () => api.get<TeamDetail>(`/admin/teams/${id}`),
    enabled: !!id,
  });
}

export function useCreateTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTeamInput) => api.post<TeamResponse>("/admin/teams", input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
  });
}

export function useUpdateTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: UpdateTeamInput & { id: string }) =>
      api.put<TeamResponse>(`/admin/teams/${id}`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
  });
}

export function useDeleteTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<void>(`/admin/teams/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
  });
}

export function useTeamMembers(teamId: string | undefined) {
  return useQuery({
    queryKey: ["teams", teamId, "members"],
    queryFn: () => api.get<TeamMember[]>(`/admin/teams/${teamId}/members`),
    enabled: !!teamId,
  });
}

export function useAddMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ teamId, ...input }: AddMemberInput & { teamId: string }) =>
      api.post<TeamMember>(`/admin/teams/${teamId}/members`, input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      queryClient.invalidateQueries({
        queryKey: ["teams", variables.teamId, "members"],
      });
    },
  });
}

export function useUpdateMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: UpdateMemberInput & { id: string }) =>
      api.put<TeamMember>(`/admin/members/${id}`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
  });
}

export function useActivateMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.put<TeamMember>(`/admin/members/${id}/activate`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
  });
}

export function useDeactivateMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.put<TeamMember>(`/admin/members/${id}/deactivate`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
  });
}

export function useRemoveMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<void>(`/admin/members/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
  });
}

export function useUpdateTeamTheme() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, themeConfig }: { id: string; themeConfig: Record<string, unknown> }) =>
      api.put<TeamResponse>(`/admin/teams/${id}/theme`, { themeConfig }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      queryClient.invalidateQueries({ queryKey: ["team-theme"] });
    },
  });
}

export function useUploadLogo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, file }: { id: string; file: File }) => {
      const formData = new FormData();
      formData.append("file", file);
      const token = localStorage.getItem("access_token");
      const base = import.meta.env.VITE_API_URL ?? "/api";
      const res = await fetch(`${base}/admin/teams/${id}/logo`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      queryClient.invalidateQueries({ queryKey: ["team-theme"] });
    },
  });
}

export function useDeleteLogo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<void>(`/admin/teams/${id}/logo`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      queryClient.invalidateQueries({ queryKey: ["team-theme"] });
    },
  });
}

export function useUploadFavicon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, file }: { id: string; file: File }) => {
      const formData = new FormData();
      formData.append("file", file);
      const token = localStorage.getItem("access_token");
      const base = import.meta.env.VITE_API_URL ?? "/api";
      const res = await fetch(`${base}/admin/teams/${id}/favicon`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      queryClient.invalidateQueries({ queryKey: ["team-theme"] });
    },
  });
}

export function useDeleteFavicon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<void>(`/admin/teams/${id}/favicon`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      queryClient.invalidateQueries({ queryKey: ["team-theme"] });
    },
  });
}
