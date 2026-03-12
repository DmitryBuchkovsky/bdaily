export interface Ticket {
  id: string;
  summary: string;
  state: string;
  type: string;
  priority: string;
  assignee: string;
  sprintName?: string;
  estimatedTime?: string;
  etaToDev?: string;
}

export interface TicketDetails extends Ticket {
  description: string;
  subtasks: Ticket[];
  linkedTickets: Ticket[];
  customFields: Record<string, unknown>;
}

export interface SprintInfo {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  goal?: string;
}

export interface BurndownPoint {
  date: Date;
  remaining: number;
  ideal: number;
}

export interface TicketSystemConfig {
  baseUrl: string;
  token: string;
  projectIds?: string[];
}

export interface TicketSystemStrategy {
  name: string;
  authenticate(config: TicketSystemConfig): Promise<boolean>;
  getAssignedTickets(userId: string): Promise<Ticket[]>;
  getTicketDetails(ticketId: string): Promise<TicketDetails>;
  searchTickets(query: string): Promise<Ticket[]>;
  getSprintInfo(sprintId?: string): Promise<SprintInfo | null>;
  getCompletedTicketsInPeriod(
    userId: string,
    from: Date,
    to: Date,
  ): Promise<Ticket[]>;
  getBurndownData(sprintId: string): Promise<BurndownPoint[]>;
}
