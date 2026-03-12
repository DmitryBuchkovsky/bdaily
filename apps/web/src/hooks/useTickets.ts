import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface Ticket {
  id: string;
  summary: string;
  state: string;
  type: string;
  priority?: string;
  assignee?: string;
  sprintName?: string;
}

export interface TicketDetails extends Ticket {
  description?: string;
  created: string;
  updated: string;
  resolved?: string;
  tags: string[];
  customFields: Record<string, unknown>;
}

export function useAssignedTickets() {
  return useQuery({
    queryKey: ["tickets", "assigned"],
    queryFn: () => api.get<Ticket[]>("/tickets/assigned"),
  });
}

export function useSearchTickets(query: string) {
  return useQuery({
    queryKey: ["tickets", "search", query],
    queryFn: () => api.get<Ticket[]>(`/tickets/search?q=${encodeURIComponent(query)}`),
    enabled: query.length >= 2,
    placeholderData: (prev) => prev,
  });
}

export function useTicketDetails(id: string | undefined) {
  return useQuery({
    queryKey: ["tickets", id],
    queryFn: () => api.get<TicketDetails>(`/tickets/${id}`),
    enabled: !!id,
  });
}
