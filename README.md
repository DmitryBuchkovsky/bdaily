# BDaily

**BDaily** is an open-source daily standup reporting platform that replaces scattered Slack messages, spreadsheets, and forgotten standups with a structured, searchable, and interactive workflow.

### What problem does it solve?

In most teams, daily standups are either:

- **Lost in chat** — buried in Slack/Teams threads, impossible to search or review later
- **Skipped entirely** — no accountability, PMs have no visibility into blockers
- **Disconnected from tickets** — developers report progress but nobody links it to actual Jira/YouTrack stories

BDaily fixes this by giving every team member a structured daily form that automatically connects to your ticket system, and gives managers a real-time board to read reports, react, comment, assign follow-up action items, and track team health over time.

### Who is it for?

- **Development teams** (2–50 people) who do daily standups
- **Project managers / team leads** who need visibility into what's happening across the team
- **Remote/hybrid teams** where async standups replace synchronous meetings

### Core workflow

1. **Developers** fill out a structured daily report: what they completed (linked to tickets), what they're working on today, any blockers, questions, and notes
2. **PMs / team leads** open the Team Board to read everyone's reports, react with emoji, leave comments or sub-questions, and assign action items with due dates
3. **Action items** follow an approval flow: assign → in progress → request done → approve/reject — with daily email reminders until resolved
4. **Everyone** gets notified via in-app, email, or Telegram when they're @mentioned, assigned a task, or someone comments on their report

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Local Development](#local-development)
  - [Prerequisites](#prerequisites)
  - [1. Clone and Install](#1-clone-and-install)
  - [2. Start PostgreSQL](#2-start-postgresql)
  - [3. Configure Environment](#3-configure-environment)
  - [4. Initialize the Database](#4-initialize-the-database)
  - [5. Seed Test Data](#5-seed-test-data)
  - [6. Start Dev Servers](#6-start-dev-servers)
  - [7. Verify](#7-verify)
- [Docker Compose (Full Stack)](#docker-compose-full-stack)
- [GitHub Codespaces](#github-codespaces)
- [Production Deployment](#production-deployment)
  - [Option A: Docker Compose (Self-Hosted)](#option-a-docker-compose-self-hosted)
  - [Option B: Separate Services](#option-b-separate-services)
  - [Option C: Platform Deployment](#option-c-platform-deployment)
  - [Reverse Proxy (Nginx)](#reverse-proxy-nginx)
  - [SSL/TLS](#ssltls)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Test Accounts](#test-accounts)
- [Scripts Reference](#scripts-reference)
- [CI/CD](#cicd)
- [Updating Between Releases](#updating-between-releases)
  - [Pre-Update Checklist](#pre-update-checklist)
  - [Docker Compose Update](#docker-compose-update)
  - [Bare-Metal / Manual Update](#bare-metal--manual-update)
  - [Platform Update (Railway, Fly.io, etc.)](#platform-update-railway-flyio-etc)
  - [Handling Breaking Changes](#handling-breaking-changes)
  - [Rollback](#rollback)
- [YouTrack Integration](#youtrack-integration)
  - [Getting a YouTrack Token](#getting-a-youtrack-token)
  - [Configuring YouTrack in BDaily](#configuring-youtrack-in-bdaily)
  - [Finding Your Project ID](#finding-your-project-id)
  - [How the Integration Works](#how-the-integration-works)
  - [Troubleshooting YouTrack](#troubleshooting-youtrack)
- [Troubleshooting](#troubleshooting)

---

## Features

- **Daily Report Form** — structured WYSIWYG sections (Tiptap) for completed work, today's plan, blockers, notes, questions, tested tickets
- **YouTrack Integration** — autocomplete from assigned tickets, live state badges, sprint data (Strategy pattern — Jira/Linear pluggable)
- **Team Board** — view all team members' daily reports, drill into any member's history
- **Report Interactions** — emoji reactions and threaded comments/sub-questions on any report
- **Action Items** — admin assigns TODOs to members with due dates; full approval flow (assign → in progress → request done → approve/reject); daily email reminders
- **@Mentions** — mention team members in any rich-text field, triggers notifications
- **Notifications** — multi-channel delivery (in-app bell, email via SMTP, Telegram bot) with per-user preferences
- **Admin Panel** — manage teams, members (invite with email, activate/deactivate accounts), shared YouTrack API token
- **Email Template Management** — admin can edit all system email templates (invite, password reset, action item, mention, comment) with live preview and `{{variable}}` placeholders
- **Password Reset** — forgot password flow with tokenized email links
- **Summaries** — per-person and per-sprint aggregated views with stats
- **Branding & Theming** — admin configurable color scheme, logo, and favicon per team via CSS custom properties
- **Page Info Blocks** — contextual help on every page explaining purpose and available actions
- **Local Email Testing** — Mailpit integration for capturing all emails during development

---

## Tech Stack

| Layer    | Technology                                                                                          |
| -------- | --------------------------------------------------------------------------------------------------- |
| Frontend | React 19, TypeScript, Vite 6, Tailwind CSS v4, TanStack Query v5, Tiptap (WYSIWYG), React Router v7 |
| Backend  | Fastify 5, TypeScript, Prisma 6, PostgreSQL 16, node-cron, nodemailer, sanitize-html                |
| Shared   | Zod validation schemas, TypeScript types                                                            |
| Infra    | Docker Compose, Turborepo, pnpm workspaces, GitHub Actions CI/CD                                    |

---

## Project Structure

```
bdaily/
├── apps/
│   ├── api/                    # Fastify REST API
│   │   ├── prisma/
│   │   │   ├── schema.prisma   # Database schema (14 models)
│   │   │   ├── migrations/     # SQL migrations
│   │   │   └── seed.ts         # Test data seeder
│   │   ├── src/
│   │   │   ├── index.ts        # App bootstrap + DI wiring
│   │   │   ├── lib/            # Prisma client, sanitize, cron
│   │   │   ├── middleware/     # auth, requireAdmin, error handler
│   │   │   ├── repositories/  # Data access (Prisma implementations)
│   │   │   ├── services/      # Business logic + notification channels
│   │   │   └── routes/        # HTTP route handlers
│   │   └── Dockerfile
│   └── web/                    # React SPA
│       ├── src/
│       │   ├── components/     # UI components (ui/, layout/, daily-form/, board/, admin/, etc.)
│       │   ├── hooks/          # TanStack Query hooks
│       │   ├── pages/          # Page components
│       │   ├── config/         # Navigation, theming, branding
│       │   └── lib/            # API client, auth context, utils
│       ├── nginx.conf          # Production Nginx config
│       └── Dockerfile
├── packages/
│   └── shared/                 # Shared Zod schemas + TypeScript types
├── docker-compose.yml          # Local development (DB + Mailpit + source mounts)
├── docker-compose.prod.yml     # Production (no dev tools, env-driven secrets)
├── .husky/pre-commit           # Pre-commit hook: lint-staged + type-check + tests
├── turbo.json                  # Turborepo task config
├── pnpm-workspace.yaml
└── .github/workflows/          # CI + GitHub Pages deploy
```

---

## Local Development

### Prerequisites

| Tool    | Version | Install                                                      |
| ------- | ------- | ------------------------------------------------------------ |
| Node.js | >= 20   | [nodejs.org](https://nodejs.org/)                            |
| pnpm    | >= 9    | `corepack enable && corepack prepare pnpm@latest --activate` |
| Docker  | Latest  | [docker.com](https://www.docker.com/)                        |
| Git     | Latest  | [git-scm.com](https://git-scm.com/)                          |

### 1. Clone and Install

```bash
git clone https://github.com/your-org/bdaily.git
cd bdaily
pnpm install
```

### 2. Start Infrastructure Services

```bash
docker compose up db mailcatcher -d
```

This starts:

- **PostgreSQL 16** on port **5434** (mapped from 5432 to avoid conflicts)
- **Mailpit** (email catcher) — SMTP on port **1025**, web UI at `http://localhost:8025`

Verify they're running:

```bash
docker compose ps
# Should show bdaily-db as "healthy" and bdaily-mail as running
```

Open `http://localhost:8025` to access the Mailpit web UI where all outgoing emails are captured.

### 3. Configure Environment

Create the API environment file:

```bash
cat > apps/api/.env << 'EOF'
DATABASE_URL=postgresql://bdaily:bdaily_dev@localhost:5434/bdaily
JWT_SECRET=dev-secret-change-in-production
PORT=8091
NODE_ENV=development
SMTP_HOST=localhost
SMTP_PORT=1025
EMAIL_FROM=noreply@bdaily.local
EOF
```

The web app uses Vite's dev proxy (`/api` -> `http://localhost:8091`) so no `.env` is needed for local dev.

### 4. Initialize the Database

```bash
# Generate the Prisma client
pnpm db:generate

# Run all migrations
cd apps/api && npx prisma migrate dev && cd ../..
```

### 5. Seed Test Data

```bash
cd apps/api && npx tsx prisma/seed.ts && cd ../..
```

This creates:

- 1 team: "Demo Team" (YouTrack config)
- 5 users: admin + 4 members (all with password `test1234`)
- ~48 daily reports across 2 weeks (weekdays) covering all report sections: completed tasks/bugs, today items, blockers, notes, questions, tested tickets
- Emoji reactions and threaded comments on reports
- Action items in all statuses (pending, in progress, pending approval, done, rejected, overdue)
- 6 email templates (invite, password reset, action item, mention, comment)

### 6. Start Dev Servers

```bash
pnpm dev
```

This uses Turborepo to start all packages in parallel:

- **API** → `http://localhost:8091` (Fastify with hot-reload via tsx)
- **Web** → `http://localhost:8090` (Vite with HMR)

Or start them individually:

```bash
# Terminal 1: API
pnpm --filter @bdaily/api dev

# Terminal 2: Web
pnpm --filter @bdaily/web dev
```

### 7. Verify

```bash
# Health check
curl http://localhost:8091/health
# → {"status":"ok"}

# Login
curl -s http://localhost:8091/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@demo.bdaily.dev","password":"test1234"}'
```

Open `http://localhost:8090` in your browser and log in with `admin@demo.bdaily.dev` / `test1234`.

---

## Docker Compose (Full Stack)

Run everything in Docker (PostgreSQL + API + Web):

```bash
docker compose up --build
```

| Service    | Container   | Port                   | URL                   |
| ---------- | ----------- | ---------------------- | --------------------- |
| PostgreSQL | bdaily-db   | 5434                   | -                     |
| Mailpit    | bdaily-mail | 1025 (SMTP), 8025 (UI) | http://localhost:8025 |
| API        | bdaily-api  | 8091                   | http://localhost:8091 |
| Web        | bdaily-web  | 8090                   | http://localhost:8090 |

To run in background:

```bash
docker compose up -d --build
```

To stop:

```bash
docker compose down        # Stop containers
docker compose down -v     # Stop + remove volumes (deletes data)
```

---

## GitHub Codespaces

The repository includes a `.devcontainer/devcontainer.json` for one-click Codespaces setup:

1. Go to the GitHub repo
2. Click **Code** → **Codespaces** → **Create codespace on main**
3. Wait for the container to build (installs deps, generates Prisma client)
4. Run `pnpm dev` in the terminal

Port forwarding is automatic for ports 8090, 8091, and 5434.

---

## Production Deployment

### Option A: Docker Compose (Self-Hosted)

Best for single-server deployments (VPS, bare-metal). This is the recommended approach.

The project ships with two compose files:

| File                      | Purpose                                                                         |
| ------------------------- | ------------------------------------------------------------------------------- |
| `docker-compose.yml`      | Local development — source mounts, dev secrets, Mailpit for emails              |
| `docker-compose.prod.yml` | Production — no source mounts, env-var–driven secrets, persistent upload volume |

Key differences in the production file:

- No Mailpit (use a real SMTP provider)
- No source volume mounts (uses built images only)
- Ports bound to `127.0.0.1` (put a reverse proxy in front)
- `restart: always` instead of `unless-stopped`
- Required env vars (`POSTGRES_PASSWORD`, `JWT_SECRET`) fail fast if unset
- Persistent `uploads` volume for logo/favicon files

#### Step 1: Server prerequisites

```bash
# Install Docker and Docker Compose on your server (Ubuntu example)
sudo apt update && sudo apt install -y docker.io docker-compose-plugin
sudo systemctl enable docker

# Install Git
sudo apt install -y git

# Clone the repository
git clone https://github.com/DmitryBuchkovsky/bdaily.git
cd bdaily
```

#### Step 2: Create production environment file

```bash
cat > .env.production << 'EOF'
# ── Database ─────────────────────────────────────────────
POSTGRES_USER=bdaily
POSTGRES_PASSWORD=CHANGE_ME_strong_password_here
POSTGRES_DB=bdaily

# ── API ──────────────────────────────────────────────────
JWT_SECRET=CHANGE_ME_at_least_32_chars_random_string
PORT=8091
NODE_ENV=production
APP_URL=https://daily.yourcompany.com
CORS_ORIGIN=https://daily.yourcompany.com

# ── Email (required for invites, password resets, notifications) ──
EMAIL_FROM=noreply@yourcompany.com
SMTP_HOST=smtp.yourprovider.com
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password

# ── Telegram (optional) ─────────────────────────────────
# TELEGRAM_BOT_TOKEN=your_telegram_bot_token
EOF
```

> **Important:** Generate strong random values for `POSTGRES_PASSWORD` and `JWT_SECRET`:
>
> ```bash
> openssl rand -hex 32   # Use output for JWT_SECRET
> openssl rand -hex 16   # Use output for POSTGRES_PASSWORD
> ```

#### Step 3: Build and start

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
```

Wait for all containers to start:

```bash
docker compose -f docker-compose.prod.yml ps
# All containers should show "Up" and DB should be "healthy"
```

#### Step 4: Initialize the database

```bash
# Run all migrations
docker exec bdaily-api npx prisma migrate deploy --schema=apps/api/prisma/schema.prisma

# Seed initial data (creates admin account and email templates)
docker exec bdaily-api npx tsx apps/api/prisma/seed.ts
```

#### Step 5: Set up a reverse proxy with SSL

See the [Reverse Proxy (Nginx)](#reverse-proxy-nginx) and [SSL/TLS](#ssltls) sections below. The built-in nginx in the web container handles `/api/` proxying internally, but you still need an external reverse proxy for SSL termination.

#### Step 6: Configure YouTrack (optional)

After first login, configure YouTrack integration to enable ticket autocomplete:

1. Log in as admin (`admin@demo.bdaily.dev` / `test1234`)
2. Go to **Teams** → click your team → fill in YouTrack Base URL, Project IDs, and API Token
3. See the [YouTrack Integration](#youtrack-integration) section for detailed instructions

> **First thing to do:** Change the default admin password via **Profile** → **Change Password**.

#### Step 7: Verify the deployment

```bash
# Health check
docker exec bdaily-api wget -qO- http://localhost:8091/health
# → {"status":"ok"}

# Check logs
docker compose -f docker-compose.prod.yml logs --tail 20

# Test from outside (replace with your domain)
curl https://daily.yourcompany.com/api/health
```

#### Updating between releases

See the full [Updating Between Releases](#updating-between-releases) section below. Quick version:

```bash
# 1. Backup database
docker exec bdaily-db pg_dump -U bdaily bdaily > backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Pull new code
git pull

# 3. Review CHANGELOG / release notes for breaking changes

# 4. Rebuild and restart
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build

# 5. Run any new migrations
docker exec bdaily-api npx prisma migrate deploy --schema=apps/api/prisma/schema.prisma

# 6. Verify
docker exec bdaily-api wget -qO- http://localhost:8091/health
```

### Option B: Separate Services

For cloud-native deployments where you run each component independently.

#### Database

Use a managed PostgreSQL service:

- **AWS RDS**, **Google Cloud SQL**, **DigitalOcean Managed Databases**, **Supabase**, **Neon**

Set `DATABASE_URL` to the connection string provided by your service.

#### API Server

```bash
# Build
cd apps/api
pnpm install --frozen-lockfile
npx prisma generate
pnpm build

# Run migrations
DATABASE_URL="postgresql://..." npx prisma migrate deploy

# Start
NODE_ENV=production \
DATABASE_URL="postgresql://..." \
JWT_SECRET="your-secret" \
PORT=8091 \
CORS_ORIGIN="https://daily.yourcompany.com" \
node dist/index.js
```

Or use the Docker image:

```bash
docker build -t bdaily-api -f apps/api/Dockerfile .
docker run -d \
  -p 8091:8091 \
  -e DATABASE_URL="postgresql://..." \
  -e JWT_SECRET="your-secret" \
  -e NODE_ENV=production \
  -e PORT=8091 \
  -e CORS_ORIGIN="https://daily.yourcompany.com" \
  bdaily-api
```

**Platform options:**

- **Railway** / **Render** / **Fly.io** — deploy the Dockerfile directly
- **AWS ECS** / **Google Cloud Run** — use the Docker image
- **Heroku** — add a `Procfile` with `web: node apps/api/dist/index.js`

#### Web (Static Site)

The frontend builds to static files — serve from any CDN or static host.

```bash
# Build
cd apps/web
VITE_API_URL="https://api.yourcompany.com" pnpm build

# Output is in dist/
ls dist/
```

**Hosting options:**

- **Nginx** / **Caddy** — serve `dist/` with SPA fallback (see nginx.conf)
- **Vercel** / **Netlify** / **Cloudflare Pages** — deploy `apps/web/dist`
- **AWS S3 + CloudFront** — upload `dist/` to S3, CloudFront in front
- **GitHub Pages** — CI workflow already included (`.github/workflows/deploy-pages.yml`)

### Option C: Platform Deployment

#### Railway

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and init
railway login
railway init

# Deploy API (set env vars in Railway dashboard)
railway up -s api

# Deploy web as static site or Dockerfile
railway up -s web
```

#### Fly.io

```bash
# API
cd apps/api
fly launch --dockerfile Dockerfile
fly secrets set DATABASE_URL="..." JWT_SECRET="..." CORS_ORIGIN="..."
fly deploy

# Web
cd apps/web
fly launch --dockerfile Dockerfile
fly deploy
```

### Reverse Proxy (Nginx)

A production Nginx config that proxies API requests and serves the frontend:

```nginx
server {
    listen 80;
    server_name daily.yourcompany.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name daily.yourcompany.com;

    ssl_certificate     /etc/ssl/certs/daily.yourcompany.com.pem;
    ssl_certificate_key /etc/ssl/private/daily.yourcompany.com.key;

    # Frontend (static files from web container or local build)
    location / {
        proxy_pass http://127.0.0.1:8090;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # API proxy
    location /api/ {
        rewrite ^/api/(.*) /$1 break;
        proxy_pass http://127.0.0.1:8091;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### SSL/TLS

Use Let's Encrypt with Certbot for free SSL:

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d daily.yourcompany.com
```

Or use Cloudflare as a reverse proxy for automatic SSL.

---

## Environment Variables

### API (`apps/api`)

| Variable             | Required | Description                                          | Default                 |
| -------------------- | -------- | ---------------------------------------------------- | ----------------------- |
| `DATABASE_URL`       | Yes      | PostgreSQL connection string                         | -                       |
| `JWT_SECRET`         | Yes      | Secret for signing JWTs (min 32 chars in production) | -                       |
| `PORT`               | No       | API server port                                      | `8091`                  |
| `HOST`               | No       | Bind address                                         | `0.0.0.0`               |
| `NODE_ENV`           | No       | `development` or `production`                        | `development`           |
| `CORS_ORIGIN`        | No       | Allowed frontend origin                              | `http://localhost:8090` |
| `EMAIL_FROM`         | No       | Sender address for email notifications               | `noreply@bdaily.app`    |
| `SMTP_HOST`          | No       | SMTP server host (enables email notifications)       | -                       |
| `SMTP_PORT`          | No       | SMTP server port                                     | `587`                   |
| `SMTP_USER`          | No       | SMTP authentication user                             | -                       |
| `SMTP_PASS`          | No       | SMTP authentication password                         | -                       |
| `TELEGRAM_BOT_TOKEN` | No       | Telegram bot token (enables Telegram notifications)  | -                       |

### Web (`apps/web`)

| Variable            | Required | Description                      | Default                         |
| ------------------- | -------- | -------------------------------- | ------------------------------- |
| `VITE_API_URL`      | No       | API base URL (set at build time) | `/api` (uses Vite proxy in dev) |
| `VITE_THEME_PRESET` | No       | Theme preset name                | `default`                       |

---

## API Endpoints

### Auth

| Method | Path                    | Description                  |
| ------ | ----------------------- | ---------------------------- |
| POST   | `/auth/register`        | Register new user            |
| POST   | `/auth/login`           | Login                        |
| POST   | `/auth/refresh`         | Refresh JWT tokens           |
| POST   | `/auth/forgot-password` | Request password reset email |
| POST   | `/auth/reset-password`  | Reset password with token    |

### Daily Reports

| Method | Path                             | Description         |
| ------ | -------------------------------- | ------------------- |
| GET    | `/daily?date=YYYY-MM-DD`         | Get report for date |
| GET    | `/daily/history?page=1&limit=10` | Report history      |
| POST   | `/daily`                         | Create report       |
| PUT    | `/daily/:id`                     | Update report       |

### Team Board

| Method | Path                     | Description              |
| ------ | ------------------------ | ------------------------ |
| GET    | `/board?date=YYYY-MM-DD` | Team board (all members) |
| GET    | `/board/:userId`         | Member report history    |
| GET    | `/board/:userId/:date`   | Single member report     |

### Action Items

| Method | Path                             | Auth     | Description                |
| ------ | -------------------------------- | -------- | -------------------------- |
| GET    | `/action-items`                  | Any      | My action items            |
| GET    | `/action-items/team`             | Admin    | Team action items          |
| GET    | `/action-items/pending-approval` | Admin    | Items awaiting my approval |
| POST   | `/action-items`                  | Admin    | Assign action item         |
| PUT    | `/action-items/:id`              | Admin    | Update item                |
| PUT    | `/action-items/:id/request-done` | Assignee | Request completion         |
| PUT    | `/action-items/:id/approve`      | Assigner | Approve completion         |
| PUT    | `/action-items/:id/reject`       | Assigner | Reject, resume reminders   |
| DELETE | `/action-items/:id`              | Admin    | Delete item                |

### Notifications

| Method | Path                                  | Description        |
| ------ | ------------------------------------- | ------------------ |
| GET    | `/notifications?unread=true&limit=20` | List notifications |
| GET    | `/notifications/unread-count`         | Unread badge count |
| PUT    | `/notifications/:id/read`             | Mark as read       |
| PUT    | `/notifications/read-all`             | Mark all as read   |

### Report Interactions

| Method | Path                            | Description                |
| ------ | ------------------------------- | -------------------------- |
| GET    | `/reports/:reportId/reactions`  | List reactions on a report |
| POST   | `/reports/:reportId/reactions`  | Add emoji reaction         |
| GET    | `/reports/:reportId/comments`   | List comments (threaded)   |
| POST   | `/reports/:reportId/comments`   | Add comment or reply       |
| PUT    | `/reports/:commentId/resolve`   | Mark comment as resolved   |
| PUT    | `/reports/:commentId/unresolve` | Reopen comment             |
| DELETE | `/reports/:commentId`           | Delete comment             |

### Admin (requires ADMIN role)

| Method | Path                            | Description                     |
| ------ | ------------------------------- | ------------------------------- |
| GET    | `/admin/teams`                  | List teams                      |
| POST   | `/admin/teams`                  | Create team                     |
| GET    | `/admin/teams/:id`              | Team details + members          |
| PUT    | `/admin/teams/:id`              | Update team                     |
| DELETE | `/admin/teams/:id`              | Delete team                     |
| PUT    | `/admin/teams/:id/theme`        | Update team theme/branding      |
| POST   | `/admin/teams/:id/logo`         | Upload team logo                |
| DELETE | `/admin/teams/:id/logo`         | Remove team logo                |
| POST   | `/admin/teams/:id/favicon`      | Upload team favicon             |
| DELETE | `/admin/teams/:id/favicon`      | Remove team favicon             |
| GET    | `/admin/teams/:id/members`      | List members                    |
| POST   | `/admin/teams/:id/members`      | Add member (sends invite email) |
| PUT    | `/admin/members/:id`            | Update member                   |
| PUT    | `/admin/members/:id/activate`   | Activate member account         |
| PUT    | `/admin/members/:id/deactivate` | Deactivate member account       |
| DELETE | `/admin/members/:id`            | Remove member                   |
| GET    | `/admin/email-templates`        | List email templates            |
| PUT    | `/admin/email-templates/:id`    | Update email template           |

### Profile

| Method | Path                     | Description                     |
| ------ | ------------------------ | ------------------------------- |
| GET    | `/profile`               | Get own profile                 |
| PUT    | `/profile`               | Update profile                  |
| PUT    | `/profile/password`      | Change password                 |
| PUT    | `/profile/notifications` | Update notification preferences |

### Theme

| Method | Path             | Description                              |
| ------ | ---------------- | ---------------------------------------- |
| GET    | `/theme/my-team` | Get current team's theme/branding config |

### Other

| Method | Path                           | Description             |
| ------ | ------------------------------ | ----------------------- |
| GET    | `/health`                      | Health check            |
| GET    | `/tickets/search?q=...`        | Search YouTrack tickets |
| GET    | `/summary/person?userId=...`   | Person summary          |
| GET    | `/summary/sprint?sprintId=...` | Sprint summary          |

---

## Test Accounts

After running the seed script, these accounts are available:

| Email                 | Password | Role   |
| --------------------- | -------- | ------ |
| admin@demo.bdaily.dev | test1234 | ADMIN  |
| alice@demo.bdaily.dev | test1234 | MEMBER |
| bob@demo.bdaily.dev   | test1234 | MEMBER |
| carol@demo.bdaily.dev | test1234 | MEMBER |
| dave@demo.bdaily.dev  | test1234 | MEMBER |

---

## Scripts Reference

Run from the repository root:

| Script               | Description                            |
| -------------------- | -------------------------------------- |
| `pnpm dev`           | Start all apps in dev mode (Turborepo) |
| `pnpm build`         | Build all packages and apps            |
| `pnpm test`          | Run all tests                          |
| `pnpm test:ci`       | Run tests with coverage                |
| `pnpm lint`          | Type-check all packages                |
| `pnpm lint:eslint`   | Run ESLint                             |
| `pnpm lint:prettier` | Check formatting                       |
| `pnpm format`        | Auto-format all files                  |
| `pnpm type-check`    | TypeScript type checking               |
| `pnpm db:generate`   | Generate Prisma client                 |
| `pnpm db:migrate`    | Run database migrations                |
| `pnpm db:push`       | Push schema to DB (no migration)       |
| `pnpm clean`         | Remove dist/ and .turbo/               |

Filter to a specific package:

```bash
pnpm --filter @bdaily/api dev     # API only
pnpm --filter @bdaily/web dev     # Web only
pnpm --filter @bdaily/shared build  # Build shared package
```

---

## Testing

The project uses [Vitest](https://vitest.dev/) across all packages with 139 unit tests.

| Package          | Tests | What's covered                                                                                                                        |
| ---------------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `@bdaily/api`    | 76    | AuthService, UserService, EmailService, TeamService, template engine, error handler, ticket system factory, password reset repository |
| `@bdaily/web`    | 39    | App rendering, PageInfoBlock, FormInput, AuthFormCard, ForgotPasswordPage, ResetPasswordPage, useEmailTemplates hooks                 |
| `@bdaily/shared` | 24    | All Zod enum schemas                                                                                                                  |

```bash
# Run all tests
pnpm test

# Run with coverage
pnpm test:ci

# Individual packages
pnpm --filter @bdaily/api test
pnpm --filter @bdaily/web test
pnpm --filter @bdaily/shared test

# Watch mode
pnpm --filter @bdaily/api test:watch
pnpm --filter @bdaily/web test:watch
```

### Pre-commit hooks

[Husky](https://typicode.github.io/husky/) runs three checks before every commit:

1. **lint-staged** — formats and lints only staged `.ts`/`.tsx` files (Prettier + ESLint)
2. **type-check** — `tsc --noEmit` across all packages
3. **test** — runs the full test suite

If any step fails, the commit is blocked.

---

## CI/CD

### GitHub Actions

Two workflows are included:

**`.github/workflows/ci.yml`** — runs on every push and PR:

- Install dependencies
- Build shared package + generate Prisma client
- ESLint + Prettier checks
- TypeScript type checking
- Run all tests with coverage

**`.github/workflows/deploy-pages.yml`** — deploys web app to GitHub Pages on push to `main`.

### Running CI locally

```bash
pnpm install --frozen-lockfile
pnpm --filter @bdaily/shared build
pnpm --filter @bdaily/api db:generate
pnpm lint:eslint
pnpm lint:prettier
pnpm type-check
pnpm test:ci
```

---

## Updating Between Releases

This section covers how to safely update BDaily from one release to the next, regardless of your deployment method.

### Pre-Update Checklist

Before every update:

1. **Read the release notes / CHANGELOG.** Look for:
   - New environment variables (add them to your `.env.production`)
   - Database migration warnings (data-destructive changes)
   - Breaking API changes (if you integrate externally)
   - Dependency version bumps that affect your host (e.g., Node.js major version)

2. **Back up the database.** This is non-negotiable — migrations cannot be reversed automatically.

   ```bash
   # Docker Compose
   docker exec bdaily-db pg_dump -U bdaily bdaily > backup_$(date +%Y%m%d_%H%M%S).sql

   # Remote / managed PostgreSQL
   pg_dump "$DATABASE_URL" > backup_$(date +%Y%m%d_%H%M%S).sql
   ```

3. **Check disk space.** Docker builds create intermediate layers; ensure you have at least 2 GB free.

4. **Notify users.** If you expect downtime (rare — typically only when migrations are large), schedule a maintenance window.

### Docker Compose Update

This is the most common path for self-hosted deployments.

```bash
# 1. Back up
docker exec bdaily-db pg_dump -U bdaily bdaily > backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Pull the latest code
git fetch origin
git checkout main
git pull origin main

# 3. Check for new environment variables in the release notes,
#    then add them to .env.production if needed
#    e.g.: echo 'NEW_VAR=value' >> .env.production

# 4. Rebuild images and restart containers (zero-downtime for web,
#    brief restart for API — typically under 10 seconds)
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build

# 5. Apply pending database migrations
docker exec bdaily-api npx prisma migrate deploy --schema=apps/api/prisma/schema.prisma

# 6. Verify the deployment
docker exec bdaily-api wget -qO- http://localhost:8091/health
# → {"status":"ok"}

# 7. Clean up old Docker images (optional, frees disk space)
docker image prune -f
```

**Updating to a specific version (tag):**

```bash
git fetch --tags
git checkout v1.2.0
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
docker exec bdaily-api npx prisma migrate deploy --schema=apps/api/prisma/schema.prisma
```

### Bare-Metal / Manual Update

For deployments where the API runs directly on the host (no Docker).

```bash
# 1. Back up the database
pg_dump "$DATABASE_URL" > backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Pull latest code
git pull origin main

# 3. Install dependencies (lockfile may have changed)
pnpm install --frozen-lockfile

# 4. Rebuild the shared package (schemas may have changed)
pnpm --filter @bdaily/shared build

# 5. Generate updated Prisma client (schema may have new models)
cd apps/api && npx prisma generate && cd ../..

# 6. Apply database migrations
cd apps/api && npx prisma migrate deploy && cd ../..

# 7. Build the API
pnpm --filter @bdaily/api build

# 8. Build the web app (set VITE_API_URL for your environment)
VITE_API_URL="/api" pnpm --filter @bdaily/web build

# 9. Restart the API process (using your process manager)
# systemd:
sudo systemctl restart bdaily-api

# PM2:
pm2 restart bdaily-api

# Manual:
kill $(cat /var/run/bdaily-api.pid)
NODE_ENV=production DATABASE_URL="..." JWT_SECRET="..." PORT=8091 \
  node apps/api/dist/index.js &

# 10. Deploy updated web static files to your web server
cp -r apps/web/dist/* /var/www/bdaily/
# or rsync:
rsync -av --delete apps/web/dist/ /var/www/bdaily/

# 11. Verify
curl http://localhost:8091/health
```

### Platform Update (Railway, Fly.io, etc.)

Most platforms auto-deploy on `git push`. The key extra step is running migrations.

**Railway:**

```bash
git push origin main
# Railway auto-deploys. Then run migrations:
railway run --service api npx prisma migrate deploy
```

**Fly.io:**

```bash
cd apps/api
fly deploy
fly ssh console -C "npx prisma migrate deploy"
```

**Render / Heroku:**

Add a release command in your service settings:

```
npx prisma migrate deploy
```

This runs automatically after each deploy, before traffic is routed to the new version.

### Handling Breaking Changes

#### New environment variables

Release notes will list any new variables. Add them before deploying:

```bash
# Docker Compose — edit your env file
echo 'TELEGRAM_BOT_TOKEN=123456:ABC-DEF' >> .env.production

# Platform — use their CLI or dashboard
railway variables set TELEGRAM_BOT_TOKEN=123456:ABC-DEF
fly secrets set TELEGRAM_BOT_TOKEN=123456:ABC-DEF
```

#### Database schema changes

Prisma migrations run forward-only. If a release includes migrations:

1. The backup you made in step 1 is your safety net
2. Run `prisma migrate deploy` — this applies only pending migrations
3. If it fails, **do not** re-run. Read the error, fix the issue, then retry

```bash
# Check migration status without applying
docker exec bdaily-api npx prisma migrate status --schema=apps/api/prisma/schema.prisma
```

#### Node.js version bumps

If a release requires a newer Node.js (check `engines` in `package.json`):

```bash
# Check current version
node --version

# Update via nvm
nvm install 22
nvm use 22

# Or update the Docker base image — handled automatically by Dockerfile
```

### Rollback

If an update goes wrong, roll back to the previous known-good state.

#### Docker Compose rollback

```bash
# 1. Stop the broken deployment
docker compose -f docker-compose.prod.yml down

# 2. Check out the previous version
git checkout v1.1.0   # or: git checkout HEAD~1

# 3. Restore the database backup
docker compose -f docker-compose.prod.yml --env-file .env.production up db -d
# Wait for DB to be healthy, then restore:
docker exec -i bdaily-db psql -U bdaily bdaily < backup_20260312_143000.sql

# 4. Rebuild and start the old version
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build

# 5. Verify
docker exec bdaily-api wget -qO- http://localhost:8091/health
```

#### Bare-metal rollback

```bash
# 1. Check out previous version
git checkout v1.1.0

# 2. Restore database
psql "$DATABASE_URL" < backup_20260312_143000.sql

# 3. Reinstall + rebuild
pnpm install --frozen-lockfile
pnpm --filter @bdaily/shared build
cd apps/api && npx prisma generate && pnpm build && cd ../..
VITE_API_URL="/api" pnpm --filter @bdaily/web build

# 4. Restart services
sudo systemctl restart bdaily-api
cp -r apps/web/dist/* /var/www/bdaily/
```

#### Why database restore is necessary for rollback

Prisma migrations are forward-only. If release `v1.2.0` added a column, rolling back the code to `v1.1.0` doesn't remove that column. The old code may fail if the schema doesn't match what it expects. Restoring the backup ensures code and schema are in sync.

---

## YouTrack Integration

BDaily integrates with JetBrains YouTrack to automatically fetch ticket details when developers reference ticket IDs in their daily reports. The integration is configured once by the admin at the team level — individual developers don't need their own tokens.

> **Note:** The integration uses the Strategy pattern, so Jira and Linear can be plugged in as alternatives. YouTrack is the default implementation.

### Getting a YouTrack Token

1. Log in to your YouTrack instance (e.g. `https://your-company.youtrack.cloud`)
2. Click your **profile avatar** (top-right) → **Profile**
3. Go to **Account Security** → **Tokens**
4. Click **New token...**
5. Configure the token:
   - **Name:** `BDaily` (or any descriptive name)
   - **Scope:** check **YouTrack** (read access is sufficient)
   - **Expiry:** set to "No expiry" for long-term use, or pick a date and rotate periodically
6. Click **Create** and **copy the token immediately** — you won't see it again

### Configuring YouTrack in BDaily

1. Log in as an **admin** user
2. Navigate to **Teams** in the sidebar (or go to `/admin/teams`)
3. Click on your team name (e.g. "Demo Team")
4. In the **Team Info** section, fill in:

| Field                  | Value                                                     | Example                               |
| ---------------------- | --------------------------------------------------------- | ------------------------------------- |
| **Ticket System Type** | Select "YouTrack"                                         | `YOUTRACK`                            |
| **Base URL**           | Your YouTrack instance URL (no trailing slash, no `/api`) | `https://your-company.youtrack.cloud` |
| **Project IDs**        | Comma-separated project short names                       | `BD, CORE, API`                       |
| **API Token**          | The permanent token you created above                     | `perm:xxx...`                         |

5. Click **Save**

The token is stored securely on the server and masked in the UI (shown as `••••••••`). When updating other team settings, you can leave the token field empty to keep the existing token.

### Finding Your Project ID

The **Project ID** is the short prefix that appears on your ticket numbers:

- If your tickets look like `BD-123`, `BD-456` → the project ID is **`BD`**
- If your tickets look like `CORE-42` → the project ID is **`CORE`**

To find it in YouTrack:

1. Go to your YouTrack instance
2. Click **Projects** in the top navigation
3. Each project shows a **Short Name** column — that's the project ID
4. Enter one or more IDs in BDaily, comma-separated: `BD, CORE, API`

### How the Integration Works

Once configured, the integration provides:

| Feature               | Description                                                                                         |
| --------------------- | --------------------------------------------------------------------------------------------------- |
| **Ticket search**     | When filling a daily report, type a ticket ID and BDaily fetches the title and status from YouTrack |
| **Assigned tickets**  | View your currently assigned unresolved tickets from YouTrack                                       |
| **Ticket details**    | Get full ticket info including state, type, priority, assignee, subtasks, and linked tickets        |
| **Sprint data**       | Fetch sprint information and burndown data from YouTrack agile boards                               |
| **Completed tickets** | Query tickets resolved within a date range for summary reports                                      |

API endpoints used by the integration:

| Method | Path                    | Description                          |
| ------ | ----------------------- | ------------------------------------ |
| GET    | `/tickets/search?q=...` | Search tickets by query              |
| GET    | `/tickets/assigned`     | Get tickets assigned to current user |
| GET    | `/tickets/:id`          | Get full ticket details              |

### Troubleshooting YouTrack

**"fetch failed" error when searching tickets:**

The API server cannot reach your YouTrack instance. Common causes:

1. **Wrong Base URL** — ensure it's the full URL with protocol: `https://your-company.youtrack.cloud` (no trailing `/`, no `/api` suffix)
2. **Self-hosted YouTrack behind a firewall** — if your YouTrack is on a private network, the Docker container needs network access to it. Add your YouTrack host to Docker's DNS or use `extra_hosts` in docker-compose:
   ```yaml
   api:
     extra_hosts:
       - "youtrack.internal:192.168.1.50"
   ```
3. **SSL certificate issues** — if using a self-signed certificate, the Node.js fetch will reject it. Set `NODE_TLS_REJECT_UNAUTHORIZED=0` in the API environment (not recommended for production — use a proper CA instead)

**Test connectivity from inside the container:**

```bash
# Check if the API container can reach YouTrack
docker compose exec api sh -c "wget -q -O- --timeout=5 https://your-company.youtrack.cloud/api/config 2>&1 | head -1"
```

**"401 Unauthorized" or empty results:**

- The token may have expired or been revoked — generate a new one
- The token scope may be insufficient — ensure "YouTrack" scope is checked
- The project IDs may not match — verify the short names in YouTrack

**No tickets showing for a user:**

- The YouTrack token determines which tickets are visible. If the token belongs to User A, `for: me` queries return User A's tickets, not the BDaily user's tickets
- For team-wide visibility, create the token from an admin/service account that can see all project tickets, and use project-based queries instead of `for: me`

---

## Troubleshooting

### Port conflicts

If ports 5434, 8090, or 8091 are in use, edit `docker-compose.yml` or `.env`:

```bash
# Check what's using a port
lsof -i :8090
```

### Database connection refused

Ensure PostgreSQL is running:

```bash
docker compose ps
docker compose logs db
```

If using local dev (not Docker), verify `DATABASE_URL` in `apps/api/.env` matches your Docker port mapping (default: `localhost:5434`).

### Prisma migration issues

```bash
# Reset database (destroys all data)
cd apps/api && npx prisma migrate reset

# Force push schema without migration
cd apps/api && npx prisma db push --force-reset
```

### "Module not found" for @bdaily/shared

Build the shared package first:

```bash
pnpm --filter @bdaily/shared build
```

### Vite proxy not working (404 on API calls)

The Vite dev server proxies `/api/*` to `http://localhost:8091` and strips the `/api` prefix. Make sure the API server is running on port 8091.

### Docker build fails with lockfile error

```bash
pnpm install    # Regenerate lockfile
docker compose build --no-cache
```

### Notifications not sending

- **Email (local dev)**: Ensure Mailpit is running (`docker compose up mailcatcher -d`) and `SMTP_HOST=localhost` / `SMTP_PORT=1025` are set in `apps/api/.env`. Check captured emails at `http://localhost:8025`
- **Email (production)**: Set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` environment variables pointing to your real SMTP provider
- **Telegram**: Set `TELEGRAM_BOT_TOKEN` and have users configure their Telegram chat ID in profile settings
- **In-app**: Always enabled by default — check `/notifications` endpoint

### YouTrack "fetch failed"

See the detailed [Troubleshooting YouTrack](#troubleshooting-youtrack) section above. Most common fix: check that the Base URL is correct (`https://your-company.youtrack.cloud` — no trailing slash, no `/api`).
