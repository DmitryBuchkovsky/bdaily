import type {
  BurndownPoint,
  SprintInfo,
  Ticket,
  TicketDetails,
  TicketSystemConfig,
  TicketSystemStrategy,
} from "./strategy.js";

const ISSUE_FIELDS =
  "id,summary,description,customFields(name,value(name,presentation))";
const ISSUE_LIST_FIELDS = "id,summary,customFields(name,value(name,presentation))";

export class YouTrackStrategy implements TicketSystemStrategy {
  readonly name = "YouTrack";
  private baseUrl = "";
  private token = "";
  private projectIds: string[] = [];

  async authenticate(config: TicketSystemConfig): Promise<boolean> {
    this.baseUrl = config.baseUrl.replace(/\/+$/, "");
    this.token = config.token;
    this.projectIds = config.projectIds ?? [];

    const response = await this.request("/api/users/me", { fields: "id,login" });
    return response.ok;
  }

  async getAssignedTickets(_userId: string): Promise<Ticket[]> {
    const projectFilter = this.projectIds.length
      ? this.projectIds.map((p) => `project: {${p}}`).join(" or ")
      : "";
    const query = `for: me State: Unresolved ${projectFilter}`.trim();

    const response = await this.request("/api/issues", {
      fields: ISSUE_LIST_FIELDS,
      query,
      $top: "50",
    });

    if (!response.ok) return [];
    const issues = (await response.json()) as YouTrackIssue[];
    return issues.map(mapIssueToTicket);
  }

  async getTicketDetails(ticketId: string): Promise<TicketDetails> {
    const response = await this.request(`/api/issues/${ticketId}`, {
      fields: `${ISSUE_FIELDS},links(direction,linkType(name),issues(${ISSUE_LIST_FIELDS}))`,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ticket ${ticketId}`);
    }

    const issue = (await response.json()) as YouTrackIssueDetailed;
    const base = mapIssueToTicket(issue);

    const subtasks: Ticket[] = [];
    const linkedTickets: Ticket[] = [];

    for (const link of issue.links ?? []) {
      const mapped = (link.issues ?? []).map(mapIssueToTicket);
      if (link.linkType?.name === "Subtask" && link.direction === "OUTWARD") {
        subtasks.push(...mapped);
      } else {
        linkedTickets.push(...mapped);
      }
    }

    const customFields: Record<string, unknown> = {};
    for (const cf of issue.customFields ?? []) {
      customFields[cf.name] = cf.value?.name ?? cf.value?.presentation ?? cf.value;
    }

    return {
      ...base,
      description: issue.description ?? "",
      subtasks,
      linkedTickets,
      customFields,
    };
  }

  async searchTickets(query: string): Promise<Ticket[]> {
    const response = await this.request("/api/issues", {
      fields: ISSUE_LIST_FIELDS,
      query,
      $top: "25",
    });

    if (!response.ok) return [];
    const issues = (await response.json()) as YouTrackIssue[];
    return issues.map(mapIssueToTicket);
  }

  async getSprintInfo(sprintId?: string): Promise<SprintInfo | null> {
    if (!sprintId || !this.projectIds[0]) return null;

    const agileId = await this.findAgileBoard();
    if (!agileId) return null;

    const response = await this.request(
      `/api/agiles/${agileId}/sprints/${sprintId}`,
      { fields: "id,name,start,finish,goal" },
    );

    if (!response.ok) return null;
    const sprint = (await response.json()) as YouTrackSprint;

    return {
      id: sprint.id,
      name: sprint.name,
      startDate: new Date(sprint.start),
      endDate: new Date(sprint.finish),
      goal: sprint.goal ?? undefined,
    };
  }

  async getCompletedTicketsInPeriod(
    _userId: string,
    from: Date,
    to: Date,
  ): Promise<Ticket[]> {
    const fromStr = from.toISOString().split("T")[0];
    const toStr = to.toISOString().split("T")[0];
    const query = `for: me resolved date: ${fromStr} .. ${toStr}`;

    const response = await this.request("/api/issues", {
      fields: ISSUE_LIST_FIELDS,
      query,
      $top: "100",
    });

    if (!response.ok) return [];
    const issues = (await response.json()) as YouTrackIssue[];
    return issues.map(mapIssueToTicket);
  }

  async getBurndownData(sprintId: string): Promise<BurndownPoint[]> {
    const agileId = await this.findAgileBoard();
    if (!agileId) return [];

    const response = await this.request(
      `/api/agiles/${agileId}/sprints/${sprintId}/report`,
      { fields: "data(xValues,remainingEstimation,idealBurndown)" },
    );

    if (!response.ok) return [];

    const report = (await response.json()) as {
      data?: {
        xValues?: number[];
        remainingEstimation?: number[];
        idealBurndown?: number[];
      };
    };

    const xValues = report.data?.xValues ?? [];
    const remaining = report.data?.remainingEstimation ?? [];
    const ideal = report.data?.idealBurndown ?? [];

    return xValues.map((ts, i) => ({
      date: new Date(ts),
      remaining: remaining[i] ?? 0,
      ideal: ideal[i] ?? 0,
    }));
  }

  private async request(
    path: string,
    params?: Record<string, string>,
  ): Promise<Response> {
    const url = new URL(`${this.baseUrl}${path}`);
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        url.searchParams.set(k, v);
      }
    }

    return fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${this.token}`,
        Accept: "application/json",
      },
    });
  }

  private async findAgileBoard(): Promise<string | null> {
    const response = await this.request("/api/agiles", {
      fields: "id,name,projects(id,shortName)",
      $top: "10",
    });

    if (!response.ok) return null;

    const boards = (await response.json()) as {
      id: string;
      projects?: { shortName: string }[];
    }[];

    if (this.projectIds.length) {
      const match = boards.find((b) =>
        b.projects?.some((p) => this.projectIds.includes(p.shortName)),
      );
      return match?.id ?? boards[0]?.id ?? null;
    }

    return boards[0]?.id ?? null;
  }
}

// --- YouTrack API response types ---

interface YouTrackCustomField {
  name: string;
  value: { name?: string; presentation?: string } | null;
}

interface YouTrackIssue {
  id: string;
  summary: string;
  description?: string;
  customFields?: YouTrackCustomField[];
}

interface YouTrackLink {
  direction: string;
  linkType?: { name: string };
  issues?: YouTrackIssue[];
}

interface YouTrackIssueDetailed extends YouTrackIssue {
  links?: YouTrackLink[];
}

interface YouTrackSprint {
  id: string;
  name: string;
  start: number;
  finish: number;
  goal?: string;
}

function getFieldValue(
  fields: YouTrackCustomField[] | undefined,
  name: string,
): string {
  const field = fields?.find((f) => f.name === name);
  return field?.value?.name ?? field?.value?.presentation ?? "";
}

function mapIssueToTicket(issue: YouTrackIssue): Ticket {
  return {
    id: issue.id,
    summary: issue.summary,
    state: getFieldValue(issue.customFields, "State"),
    type: getFieldValue(issue.customFields, "Type"),
    priority: getFieldValue(issue.customFields, "Priority"),
    assignee: getFieldValue(issue.customFields, "Assignee"),
    sprintName: getFieldValue(issue.customFields, "Sprint") || undefined,
    estimatedTime:
      getFieldValue(issue.customFields, "Estimation") || undefined,
  };
}
