# BDaily - Daily Standup Report App

## Overview

BDaily replaces spreadsheet-based daily standup tracking with a structured web application.
It integrates with ticket systems (YouTrack first, extensible to Jira/Linear) to auto-populate
ticket data, and provides individual + team summaries per sprint or custom date range.

---

## Tech Stack

| Layer              | Technology                     | Rationale                              |
| ------------------ | ------------------------------ | -------------------------------------- |
| **Frontend**       | React + TypeScript + Vite      | Fast dev, strong typing, modern DX     |
| **UI**             | shadcn/ui + Tailwind CSS       | Beautiful, accessible, customizable    |
| **State**          | TanStack Query                 | Server state management, caching       |
| **Backend**        | Node.js + Fastify              | Lightweight, fast, TypeScript-native   |
| **Database**       | PostgreSQL + Prisma ORM        | Relational data fits well, great DX    |
| **Auth**           | JWT (access + refresh tokens)  | Simple, stateless                      |
| **Ticket System**  | Strategy Pattern abstraction   | Pluggable: YouTrack now, Jira later    |
| **Monorepo**       | pnpm workspaces + Turborepo    | Fast builds, shared packages           |
| **Infrastructure** | Docker Compose                 | Local dev + Codespaces + deployment    |

---

## Data Model

### User
- id, email, name, avatarUrl, role (ADMIN | MEMBER)
- ticketSystemToken (encrypted)
- teamId

### Team
- id, name
- ticketSystemType (YOUTRACK | JIRA | LINEAR)
- ticketSystemConfig (JSON: baseUrl, projectIds, etc.)

### DailyReport
- id, userId, date, createdAt, updatedAt

### CompletedItem
- id, dailyReportId
- type: TASK | BUG_FIX
- ticketId (nullable, linked to ticket system)
- title, details
- status: COMPLETED | MERGED | DEPLOYED
- prLink, commitHash
- rootCause, solution, impact (for BUG_FIX type)

### TodayItem
- id, dailyReportId
- priority: PRIMARY | SECONDARY
- ticketId (nullable)
- title, goal, approach
- etaToDev (date, nullable)

### Blocker
- id, dailyReportId
- type: TECHNICAL | DEPENDENCY
- description, impact
- need, waitingFor, expectedResolution
- resolvedAt (nullable)

### AdditionalNotes
- id, dailyReportId
- codeReviewRequests, testingStatus
- deploymentNotes, learningResearch

### Question
- id, dailyReportId
- type: TECHNICAL | PRODUCT | PROCESS
- content

### TestedTicket
- id, dailyReportId
- ticketId, title
- result: APPROVED | REJECTED

---

## Ticket System Integration (Strategy Pattern)

### Interface

```typescript
interface TicketSystemStrategy {
  name: string;
  authenticate(config: TicketSystemConfig): Promise<boolean>;
  getAssignedTickets(userId: string): Promise<Ticket[]>;
  getTicketDetails(ticketId: string): Promise<TicketDetails>;
  searchTickets(query: string): Promise<Ticket[]>;
  getTicketStates(): Promise<TicketState[]>;
  getSprintInfo(sprintId?: string): Promise<SprintInfo>;
  getSprintBoard(sprintId: string): Promise<SprintBoard>;
  getCompletedTicketsInPeriod(userId: string, from: Date, to: Date): Promise<Ticket[]>;
  getBurndownData(sprintId: string): Promise<BurndownPoint[]>;
}
```

### YouTrack Implementation
- Uses YouTrack REST API with Bearer token auth
- Key endpoints:
  - `GET /api/issues?query=for:me+#Unresolved` - assigned tickets
  - `GET /api/issues/{id}?fields=...` - ticket details
  - `GET /api/agiles/{agileId}/sprints?fields=...` - sprint info
  - `GET /api/users/me` - verify token

### Factory
```typescript
TicketSystemFactory.create('youtrack' | 'jira' | 'linear', config)
```

---

## Summary Feature

### Types
1. **Person Summary** - per user, per sprint or date range
   - Tickets completed, bugs fixed, tickets tested, blockers raised
   - Dailies filled count, PR count
2. **Sprint Summary** - team-wide for a sprint
   - Stories/bugs progress, active blockers, per-person breakdown
   - Burndown chart from YouTrack
3. **General Summary** - team-wide for arbitrary date range
   - Same as sprint summary but custom period

### API
- `GET /api/summary/person/:userId?sprintId=X` or `?from=&to=`
- `GET /api/summary/sprint/:sprintId`
- `GET /api/summary/team/:teamId?from=&to=`
- `GET /api/summary/export?type=person|sprint|team&format=markdown|csv|json`

### Caching
- Compute-on-request with short TTL cache (dailies change at most once/day)

---

## Key Features

### Daily Report Form
- Date picker (defaults to today)
- Ticket autocomplete searching YouTrack assigned tickets
- Sections: Completed Yesterday, Working On Today, Blockers, Notes, Questions, Tested Tickets
- Auto-fill "today" from yesterday's report
- Auto-suggest completed items from ticket state changes

### Team Dashboard
- All members' dailies for a date
- Sprint overview from YouTrack
- Blocker visibility across team

### Summary Views
- Person summary card with stats + timeline
- Sprint summary dashboard with charts and team table
- Export to Markdown, CSV, JSON, clipboard

### History & Export
- Browse past dailies by date
- Export formatted for Slack/Teams

---

## Implementation Phases

### Phase 1 - MVP (1-2 weeks)
- [x] Project scaffolding (monorepo, docker, devcontainer)
- [ ] JWT auth (login/register)
- [ ] Daily report CRUD (all sections)
- [ ] YouTrack integration (assigned tickets, autocomplete, ticket state)
- [ ] View own daily history

### Phase 2 - Team Features (1 week)
- [ ] Team dashboard (all members' dailies by date)
- [ ] Sprint info from YouTrack
- [ ] Person summary view (per sprint + date range)
- [ ] Sprint summary dashboard with team table
- [ ] Blocker visibility

### Phase 3 - Smart Features (1 week)
- [ ] Auto-fill today from yesterday
- [ ] Auto-suggest completed from ticket state changes
- [ ] Auto-populate tested tickets from "Ready for QA"
- [ ] Burndown/charts in sprint summary
- [ ] Export (Markdown, CSV)

### Phase 4 - Polish & Extensibility
- [ ] Jira / Linear strategy implementations
- [ ] Reminder notifications (Slack/email)
- [ ] Analytics (trends, blocker frequency)
- [ ] Custom date range summaries
- [ ] Sprint comparison / trend charts
- [ ] Google Sheets export for backward compatibility

---

## Deployment

### Local Development
```bash
docker compose up
```

### GitHub Codespaces
- `.devcontainer/devcontainer.json` references `docker-compose.yml`
- Click "Open in Codespaces" for instant dev environment

### Production Options
- Railway.app (easiest Docker deploy, free credits)
- Render.com (free tier web services + managed Postgres)
- Fly.io (container-based, free allowances)
