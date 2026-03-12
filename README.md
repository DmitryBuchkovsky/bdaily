# BDaily

Daily standup report app with YouTrack integration. Replaces spreadsheet-based daily tracking with structured forms, ticket autocomplete, and team/sprint summaries.

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) >= 20
- [pnpm](https://pnpm.io/) >= 9
- [Docker](https://www.docker.com/) (for PostgreSQL)

### Local Development

```bash
# Install dependencies
pnpm install

# Start PostgreSQL
docker compose up db -d

# Generate Prisma client
pnpm db:generate

# Run database migrations
pnpm db:migrate

# Start all apps in dev mode
pnpm dev
```

The web app runs at `http://localhost:3000` and the API at `http://localhost:3001`.

### Full Docker Setup

```bash
docker compose up
```

This starts PostgreSQL, the API server, and the web app.

### GitHub Codespaces

Click "Open in Codespaces" on the GitHub repo to get a fully configured dev environment with all services running.

## Project Structure

```
bdaily/
├── apps/
│   ├── api/          # Fastify REST API (TypeScript, Prisma)
│   └── web/          # React SPA (Vite, Tailwind, shadcn/ui)
├── packages/
│   └── shared/       # Shared types and Zod validation schemas
├── docker-compose.yml
├── PLAN.md           # Full architecture and implementation plan
└── turbo.json        # Turborepo config
```

## Features

- **Daily Report Form** -- structured sections for completed work, today's plan, blockers, notes, questions, tested tickets
- **YouTrack Integration** -- autocomplete from assigned tickets, live state badges, sprint data
- **Summaries** -- per-person and per-sprint aggregated views with stats
- **Team Dashboard** -- see all members' dailies for any date
- **Strategy Pattern** -- pluggable ticket system (YouTrack first, Jira/Linear planned)

## Environment Variables

### API (`apps/api`)

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | - |
| `JWT_SECRET` | Secret for signing JWTs | - |
| `PORT` | API server port | `3001` |

### Web (`apps/web`)

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | API base URL | `http://localhost:3001` |

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, TanStack Query
- **Backend**: Fastify 5, TypeScript, Prisma 6, PostgreSQL 16
- **Shared**: Zod schemas, TypeScript types
- **Infra**: Docker Compose, GitHub Codespaces, Turborepo
