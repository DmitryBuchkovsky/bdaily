import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface EmailTemplate {
  id: string;
  slug: string;
  name: string;
  subject: string;
  bodyHtml: string;
  description: string | null;
  variables: string[];
  updatedAt: string;
}

export interface UpdateEmailTemplateInput {
  name?: string;
  subject: string;
  bodyHtml: string;
  description?: string;
}

export function useEmailTemplates() {
  return useQuery({
    queryKey: ["email-templates"],
    queryFn: () => api.get<EmailTemplate[]>("/admin/email-templates"),
  });
}

export function useUpdateEmailTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: UpdateEmailTemplateInput & { id: string }) =>
      api.put<EmailTemplate>(`/admin/email-templates/${id}`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-templates"] });
    },
  });
}
