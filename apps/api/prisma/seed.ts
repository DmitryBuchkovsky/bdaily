import { PrismaClient, type User } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d;
}

function _isoDate(d: Date): string {
  return d.toISOString().split("T")[0]!;
}

function isWeekday(d: Date): boolean {
  const day = d.getDay();
  return day !== 0 && day !== 6;
}

function getWeekdays(startDaysAgo: number, endDaysAgo: number): Date[] {
  const dates: Date[] = [];
  for (let i = startDaysAgo; i >= endDaysAgo; i--) {
    const d = daysAgo(i);
    if (isWeekday(d)) dates.push(d);
  }
  return dates;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

const TICKET_IDS = [
  "DEMO-101",
  "DEMO-102",
  "DEMO-103",
  "DEMO-104",
  "DEMO-105",
  "DEMO-201",
  "DEMO-202",
  "DEMO-203",
  "DEMO-204",
  "DEMO-205",
  "DEMO-301",
  "DEMO-302",
  "DEMO-303",
  "DEMO-304",
  "DEMO-305",
];

const EMOJIS = ["👍", "🎉", "🔥", "❤️", "🚀", "👀", "💯", "✅"];

const COMPLETED_TASKS = [
  {
    title: "Implement user authentication flow",
    details: "<p>Built login/register forms with JWT token management and refresh logic.</p>",
  },
  {
    title: "Fix pagination bug on team board",
    details:
      "<p>Resolved off-by-one error in page calculation that skipped the last page of results.</p>",
  },
  {
    title: "Add dark mode support",
    details:
      "<p>Implemented CSS custom properties for theme switching with system preference detection.</p>",
  },
  {
    title: "Refactor notification service",
    details:
      "<p>Split monolithic notification handler into strategy-based channels (email, in-app, telegram).</p>",
  },
  {
    title: "Database migration for action items",
    details:
      "<p>Created new action_items table with proper indexes and foreign key constraints.</p>",
  },
  {
    title: "Write E2E tests for daily form",
    details:
      "<p>Added Playwright tests covering form submission, validation errors, and draft saving.</p>",
  },
  {
    title: "Update API error handling",
    details: "<p>Standardized error responses across all routes with proper HTTP status codes.</p>",
  },
  {
    title: "Optimize bundle size",
    details:
      "<p>Reduced initial JS bundle by 35% through code splitting and lazy loading routes.</p>",
  },
  {
    title: "Add WYSIWYG editor to daily form",
    details: "<p>Integrated Tiptap editor with mentions, links, and basic formatting support.</p>",
  },
  {
    title: "Implement team invitation flow",
    details:
      "<p>Admin can now add members with auto-generated passwords and email invitations.</p>",
  },
];

const COMPLETED_BUGS = [
  {
    title: "Fix memory leak in WebSocket handler",
    rootCause: "<p>Event listeners were not being removed on component unmount.</p>",
    solution: "<p>Added cleanup function in useEffect to remove listeners.</p>",
    impact: "<p>Reduced memory usage by ~200MB in long-running sessions.</p>",
  },
  {
    title: "Fix broken redirect after login",
    rootCause: "<p>React Router state was lost during the auth redirect chain.</p>",
    solution: "<p>Stored intended destination in location state before redirect.</p>",
    impact: "<p>Users now correctly return to their previous page after login.</p>",
  },
  {
    title: "Fix date timezone issue in reports",
    rootCause: "<p>Server was using UTC while client sent local timezone dates.</p>",
    solution: "<p>Normalized all dates to UTC at the API boundary.</p>",
    impact: "<p>Reports no longer appear on wrong dates for non-UTC users.</p>",
  },
  {
    title: "Fix race condition in concurrent saves",
    rootCause: "<p>Two rapid form submissions could create duplicate reports.</p>",
    solution: "<p>Added unique constraint on (userId, date) and optimistic locking.</p>",
    impact: "<p>No more duplicate daily reports appearing in history.</p>",
  },
];

const TODAY_ITEMS = [
  {
    title: "Implement sprint summary calculations",
    goal: "<p>Aggregate completed items per user for the sprint period.</p>",
    approach: "<p>Use Prisma groupBy with date range filters, then compute velocity metrics.</p>",
  },
  {
    title: "Design team settings page",
    goal: "<p>Create a clean admin interface for managing team configuration.</p>",
    approach: "<p>Use shadcn/ui form components with react-hook-form validation.</p>",
  },
  {
    title: "Add file upload for avatars",
    goal: "<p>Allow users to upload profile pictures.</p>",
    approach: "<p>Use @fastify/multipart with sharp for image resizing, store in uploads/ dir.</p>",
  },
  {
    title: "Set up CI/CD pipeline",
    goal: "<p>Automate testing and deployment on push to main.</p>",
    approach: "<p>GitHub Actions with Docker build, test, and deploy stages.</p>",
  },
  {
    title: "Implement @mentions in reports",
    goal: "<p>Users can @mention teammates in text fields.</p>",
    approach: "<p>Tiptap mention extension with user suggestion dropdown.</p>",
  },
  {
    title: "Add emoji reactions to reports",
    goal: "<p>Team members can react to daily reports with emoji.</p>",
    approach: "<p>Create ReportReaction model with unique constraint on user+report+emoji.</p>",
  },
  {
    title: "Review and merge PR #42",
    goal: "<p>Code review the notification refactor PR.</p>",
    approach: "<p>Read through changes, run tests locally, check for edge cases.</p>",
  },
  {
    title: "Performance profiling of dashboard",
    goal: "<p>Identify and fix slow queries on the dashboard page.</p>",
    approach: "<p>Use Prisma query logging and React DevTools Profiler to find bottlenecks.</p>",
  },
];

const BLOCKERS = [
  {
    type: "TECHNICAL" as const,
    description: "<p>Redis connection keeps dropping in staging environment.</p>",
    impact: "<p>Cannot test caching layer properly, slowing down performance work.</p>",
    need: "<p>DevOps to check Redis configuration and network rules.</p>",
    waitingFor: "DevOps team",
  },
  {
    type: "DEPENDENCY" as const,
    description: "<p>Waiting for design team to finalize the new dashboard mockups.</p>",
    impact: "<p>Cannot start frontend implementation of the redesigned dashboard.</p>",
    need: "<p>Final Figma designs with component specifications.</p>",
    waitingFor: "Design team",
  },
  {
    type: "TECHNICAL" as const,
    description: "<p>TypeScript compiler crashing on large union types in shared schemas.</p>",
    impact: "<p>Build times increased from 5s to 45s, blocking fast iteration.</p>",
    need: "<p>Investigate TS 5.x improvements or restructure types.</p>",
  },
  {
    type: "DEPENDENCY" as const,
    description: "<p>Third-party API rate limit reached during testing.</p>",
    impact: "<p>Integration tests are flaky and sometimes timeout.</p>",
    need: "<p>Request rate limit increase or implement proper mocking.</p>",
    waitingFor: "API provider support",
  },
];

const QUESTIONS = [
  {
    type: "TECHNICAL" as const,
    content:
      "<p>Should we use server-side rendering for the public pages or keep everything as a SPA?</p>",
  },
  {
    type: "PRODUCT" as const,
    content: "<p>Do we need to support bulk actions on the action items list?</p>",
  },
  {
    type: "PROCESS" as const,
    content: "<p>Can we switch from bi-weekly to weekly sprint cycles for faster feedback?</p>",
  },
  {
    type: "TECHNICAL" as const,
    content: "<p>What's our strategy for database backups in production?</p>",
  },
  {
    type: "PRODUCT" as const,
    content: "<p>Should the notification bell show a count badge or just a dot indicator?</p>",
  },
  {
    type: "PROCESS" as const,
    content: "<p>Who should review PRs when the primary reviewer is on vacation?</p>",
  },
];

const COMMENTS = [
  "Great progress on this! Can you share the performance benchmarks?",
  "I noticed a similar issue last week — check if it's related to the caching layer.",
  "Nice work! This will save us a lot of time.",
  "Can we schedule a quick sync to discuss the approach for this?",
  "Have you considered using a connection pool here instead?",
  "This is looking really good. One suggestion: add error boundaries around the new components.",
  "I had a question about the migration strategy — do we need downtime?",
  "Love the clean separation of concerns here. The strategy pattern really pays off.",
  "Could we add a loading skeleton for this section? It flickers on slow connections.",
  "Let me know if you need help testing — I can cover the edge cases.",
];

const COMMENT_REPLIES = [
  "Good point! I'll run benchmarks this afternoon and share results.",
  "Thanks for the heads up — I'll investigate the connection.",
  "Agreed, I'll open a follow-up ticket for that.",
  "Sure, let's do 15 minutes after standup tomorrow.",
  "Already done! Added it in the latest commit.",
  "That's a great idea, I'll add it to my task list for today.",
];

interface SeedUser extends User {
  _idx: number;
}

async function seedReports(users: SeedUser[], teamId: string): Promise<void> {
  const dates = getWeekdays(14, 0);
  let reportCount = 0;
  let actionCount = 0;
  let reactionCount = 0;
  let commentCount = 0;

  for (const date of dates) {
    const dayIndex = dates.indexOf(date);

    for (const user of users) {
      // Skip ~10% of days randomly to simulate missed reports (except admin fills every day)
      if (user.role !== "ADMIN" && Math.random() < 0.1) continue;

      const report = await prisma.dailyReport.create({
        data: {
          userId: user.id,
          date,
        },
      });

      // ── Completed items ─────────────────────────────────────────────
      const completedCount = 1 + (dayIndex % 3); // 1-3 items
      for (let i = 0; i < completedCount; i++) {
        const isBug = i === 0 && dayIndex % 4 === user._idx % 4;

        if (isBug) {
          const bug = pick(COMPLETED_BUGS);
          await prisma.completedItem.create({
            data: {
              dailyReportId: report.id,
              type: "BUG_FIX",
              ticketId: pick(TICKET_IDS),
              title: bug.title,
              details: bug.rootCause,
              status: pick(["COMPLETED", "MERGED", "DEPLOYED"] as const),
              prLink: `https://github.com/example/bdaily/pull/${100 + dayIndex * 10 + i}`,
              rootCause: bug.rootCause,
              solution: bug.solution,
              impact: bug.impact,
            },
          });
        } else {
          const task = pick(COMPLETED_TASKS);
          const hasTicket = Math.random() > 0.2;
          const hasPr = Math.random() > 0.3;
          const hasCommit = !hasPr && Math.random() > 0.5;
          await prisma.completedItem.create({
            data: {
              dailyReportId: report.id,
              type: "TASK",
              ticketId: hasTicket ? pick(TICKET_IDS) : undefined,
              title: task.title,
              details: task.details,
              status: pick(["COMPLETED", "MERGED", "DEPLOYED"] as const),
              prLink: hasPr
                ? `https://github.com/example/bdaily/pull/${100 + dayIndex * 10 + i}`
                : undefined,
              commitHash: hasCommit ? `abc${dayIndex}${i}def` : undefined,
            },
          });
        }
      }

      // ── Today items ─────────────────────────────────────────────────
      const todayCount = 1 + (dayIndex % 3); // 1-3 items
      for (let i = 0; i < todayCount; i++) {
        const item = pick(TODAY_ITEMS);
        const hasTicket = Math.random() > 0.3;
        const hasEta = Math.random() > 0.5;
        const hasGoal = Math.random() > 0.2;
        const hasApproach = hasGoal && Math.random() > 0.3;
        await prisma.todayItem.create({
          data: {
            dailyReportId: report.id,
            priority: i === 0 ? "PRIMARY" : "SECONDARY",
            ticketId: hasTicket ? pick(TICKET_IDS) : undefined,
            title: item.title,
            goal: hasGoal ? item.goal : undefined,
            approach: hasApproach ? item.approach : undefined,
            etaToDev: hasEta ? daysAgo(-1 - i) : undefined,
          },
        });
      }

      // ── Blockers (some days only) ──────────────────────────────────
      if (dayIndex % 5 === user._idx % 5 || dayIndex % 7 === 0) {
        const blocker = pick(BLOCKERS);
        const isResolved = Math.random() > 0.6;
        await prisma.blocker.create({
          data: {
            dailyReportId: report.id,
            type: blocker.type,
            description: blocker.description,
            impact: blocker.impact,
            need: blocker.need,
            waitingFor: blocker.waitingFor,
            expectedResolution: Math.random() > 0.5 ? "End of week" : undefined,
            resolvedAt: isResolved ? daysAgo(dayIndex - 1) : undefined,
          },
        });
      }

      // ── Additional notes (alternate days) ──────────────────────────
      if ((dayIndex + user._idx) % 3 === 0) {
        const hasReview = Math.random() > 0.4;
        const hasTesting = Math.random() > 0.5;
        const hasDeploy = Math.random() > 0.6;
        const hasLearning = Math.random() > 0.5;
        await prisma.additionalNotes.create({
          data: {
            dailyReportId: report.id,
            codeReviewRequests: hasReview
              ? "<p>PR #42 needs review — notification refactor. PR #45 — new team settings page.</p>"
              : undefined,
            testingStatus: hasTesting
              ? "<p>Integration tests passing. Need to add E2E coverage for the new action items flow.</p>"
              : undefined,
            deploymentNotes: hasDeploy
              ? "<p>Staging deploy scheduled for 3 PM. Need to run migration before deploying.</p>"
              : undefined,
            learningResearch: hasLearning
              ? "<p>Explored Tiptap's collaboration extension for real-time editing. Looks promising for future multi-user editing.</p>"
              : undefined,
          },
        });
      }

      // ── Questions (some days) ──────────────────────────────────────
      if (dayIndex % 4 === user._idx % 4) {
        const qCount = 1 + (dayIndex % 2);
        for (let i = 0; i < qCount; i++) {
          const q = pick(QUESTIONS);
          await prisma.question.create({
            data: {
              dailyReportId: report.id,
              type: q.type,
              content: q.content,
            },
          });
        }
      }

      // ── Tested tickets (QA-style, some users some days) ────────────
      if (user._idx >= 2 && dayIndex % 3 === 0) {
        const tCount = 1 + (dayIndex % 2);
        for (let i = 0; i < tCount; i++) {
          await prisma.testedTicket.create({
            data: {
              dailyReportId: report.id,
              ticketId: pick(TICKET_IDS),
              title: pick([
                "Verify login flow on mobile",
                "Test notification delivery",
                "Validate form submission edge cases",
                "Check role-based access control",
                "Test file upload size limits",
                "Verify email template rendering",
              ]),
              result: Math.random() > 0.3 ? "APPROVED" : "REJECTED",
            },
          });
        }
      }

      reportCount++;
    }

    // ── Reactions on today's reports (other users react) ────────────
    const todayReports = await prisma.dailyReport.findMany({
      where: { date },
      select: { id: true, userId: true },
    });

    for (const report of todayReports) {
      const otherUsers = users.filter((u) => u.id !== report.userId);
      // Each report gets 0-3 reactions from other users
      const reactorCount = dayIndex % 4;
      for (let i = 0; i < Math.min(reactorCount, otherUsers.length); i++) {
        const reactor = otherUsers[i]!;
        const emoji = EMOJIS[(dayIndex + i) % EMOJIS.length]!;
        try {
          await prisma.reportReaction.create({
            data: {
              dailyReportId: report.id,
              userId: reactor.id,
              emoji,
            },
          });
          reactionCount++;
        } catch {
          // unique constraint — skip
        }
      }
    }

    // ── Comments on some reports ─────────────────────────────────────
    if (dayIndex % 2 === 0 && todayReports.length > 0) {
      const targetReport = pick(todayReports);
      const commenter = users.find((u) => u.id !== targetReport.userId) ?? users[0]!;
      const comment = await prisma.reportComment.create({
        data: {
          dailyReportId: targetReport.id,
          userId: commenter.id,
          content: pick(COMMENTS),
          resolved: dayIndex < 5,
        },
      });
      commentCount++;

      // Add a reply thread on some comments
      if (dayIndex % 4 === 0) {
        const replier =
          users.find((u) => u.id !== commenter.id && u.id !== targetReport.userId) ?? users[0]!;
        await prisma.reportComment.create({
          data: {
            dailyReportId: targetReport.id,
            userId: replier.id,
            content: pick(COMMENT_REPLIES),
            parentId: comment.id,
          },
        });
        commentCount++;

        // Original author replies back
        await prisma.reportComment.create({
          data: {
            dailyReportId: targetReport.id,
            userId: targetReport.userId,
            content: pick(COMMENT_REPLIES),
            parentId: comment.id,
          },
        });
        commentCount++;
      }
    }
  }

  // ── Action items (various statuses) ────────────────────────────────
  const admin = users.find((u) => u.role === "ADMIN")!;
  const members = users.filter((u) => u.role === "MEMBER");
  const statuses: Array<{
    status: "PENDING" | "IN_PROGRESS" | "PENDING_APPROVAL" | "DONE" | "REJECTED" | "OVERDUE";
    completedAt?: Date;
  }> = [
    { status: "PENDING" },
    { status: "IN_PROGRESS" },
    { status: "PENDING_APPROVAL", completedAt: daysAgo(1) },
    { status: "DONE", completedAt: daysAgo(3) },
    { status: "REJECTED" },
    { status: "OVERDUE" },
  ];

  const actionTitles = [
    {
      title: "Update API documentation for v2 endpoints",
      description:
        "<p>Document all new endpoints added in the v2 release including request/response schemas.</p>",
    },
    {
      title: "Add input validation to settings form",
      description:
        "<p>Implement Zod validation for all settings form fields with proper error messages.</p>",
    },
    {
      title: "Review and optimize database queries",
      description: "<p>Profile slow queries on the dashboard and add missing indexes.</p>",
    },
    {
      title: "Write unit tests for notification service",
      description:
        "<p>Cover all notification channels and edge cases with at least 80% coverage.</p>",
    },
    {
      title: "Prepare sprint demo presentation",
      description:
        "<p>Create slides covering completed features, metrics, and next sprint goals.</p>",
    },
    {
      title: "Fix accessibility issues on login page",
      description: "<p>Address WCAG 2.1 AA violations found in the latest audit.</p>",
    },
    {
      title: "Set up monitoring alerts for production",
      description: "<p>Configure alerts for error rate spikes, high latency, and disk usage.</p>",
    },
    {
      title: "Migrate legacy CSS to Tailwind classes",
      description:
        "<p>Replace remaining custom CSS with Tailwind utility classes for consistency.</p>",
    },
  ];

  for (let i = 0; i < members.length; i++) {
    const member = members[i]!;
    // Each member gets 2 action items with different statuses
    for (let j = 0; j < 2; j++) {
      const idx = (i * 2 + j) % statuses.length;
      const s = statuses[idx]!;
      const actionData = actionTitles[(i * 2 + j) % actionTitles.length]!;
      const dueDaysAgo = s.status === "OVERDUE" ? 3 : -(2 + j * 3);

      // Some action items linked to reports
      let linkedReportId: string | undefined;
      if (j === 0) {
        const memberReport = await prisma.dailyReport.findFirst({
          where: { userId: member.id },
          orderBy: { date: "desc" },
        });
        linkedReportId = memberReport?.id;
      }

      await prisma.actionItem.create({
        data: {
          assignedById: admin.id,
          assigneeId: member.id,
          teamId,
          dailyReportId: linkedReportId,
          title: actionData.title,
          description: actionData.description,
          dueDate: daysAgo(dueDaysAgo),
          status: s.status,
          completedAt: s.completedAt,
          lastRemindedAt: s.status === "OVERDUE" ? daysAgo(1) : undefined,
        },
      });
      actionCount++;
    }
  }

  // Admin also gets one action item from a member
  const actionFromMember = actionTitles[6]!;
  await prisma.actionItem.create({
    data: {
      assignedById: members[0]!.id,
      assigneeId: admin.id,
      teamId,
      title: actionFromMember.title,
      description: actionFromMember.description,
      dueDate: daysAgo(-5),
      status: "IN_PROGRESS",
    },
  });
  actionCount++;

  console.log(`  Reports: ${reportCount}`);
  console.log(`  Reactions: ${reactionCount}`);
  console.log(`  Comments: ${commentCount}`);
  console.log(`  Action items: ${actionCount}`);
}

async function main(): Promise<void> {
  // Clean existing data in order (child tables first)
  await prisma.reportComment.deleteMany();
  await prisma.reportReaction.deleteMany();
  await prisma.mention.deleteMany();
  await prisma.testedTicket.deleteMany();
  await prisma.question.deleteMany();
  await prisma.additionalNotes.deleteMany();
  await prisma.blocker.deleteMany();
  await prisma.todayItem.deleteMany();
  await prisma.completedItem.deleteMany();
  await prisma.actionItem.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.dailyReport.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  console.log("Cleaned existing data\n");

  const team = await prisma.team.upsert({
    where: { id: "00000000-0000-0000-0000-000000000001" },
    update: { name: "Demo Team" },
    create: {
      id: "00000000-0000-0000-0000-000000000001",
      name: "Demo Team",
      ticketSystemType: "YOUTRACK",
      ticketSystemConfig: {
        baseUrl: "https://youtrack.example.com",
        projectIds: ["DEMO"],
      },
    },
  });

  console.log(`Team: ${team.name} (${team.id})`);

  const password = await bcrypt.hash("test1234", 12);

  const userDefs = [
    { email: "admin@demo.bdaily.dev", name: "Admin", role: "ADMIN" as const },
    { email: "alice@demo.bdaily.dev", name: "Alice", role: "MEMBER" as const },
    { email: "bob@demo.bdaily.dev", name: "Bob", role: "MEMBER" as const },
    { email: "carol@demo.bdaily.dev", name: "Carol", role: "MEMBER" as const },
    { email: "dave@demo.bdaily.dev", name: "Dave", role: "MEMBER" as const },
  ];

  const users: SeedUser[] = [];
  for (let idx = 0; idx < userDefs.length; idx++) {
    const u = userDefs[idx]!;
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        email: u.email,
        name: u.name,
        role: u.role,
        passwordHash: password,
        teamId: team.id,
      },
    });
    users.push({ ...user, _idx: idx });
    console.log(`User: ${user.name} <${user.email}> [${user.role}]`);
  }

  console.log("\nSeeding daily reports (2 weeks)...");
  await seedReports(users, team.id);

  // ── Email templates ──────────────────────────────────────────────────
  const templates = [
    {
      slug: "invite",
      name: "Team Invite",
      description: "Sent when an admin adds a new team member",
      subject: "You've been invited to {{appName}}",
      variables: ["name", "email", "password", "appUrl", "appName"],
      bodyHtml: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto">
  <h2 style="color:#333">Welcome to {{appName}}, {{name}}!</h2>
  <p>You've been added to the team. Here are your login credentials:</p>
  <table style="border-collapse:collapse;margin:16px 0">
    <tr><td style="padding:6px 12px;font-weight:bold;color:#555">Email</td><td style="padding:6px 12px">{{email}}</td></tr>
    <tr><td style="padding:6px 12px;font-weight:bold;color:#555">Password</td><td style="padding:6px 12px;font-family:monospace">{{password}}</td></tr>
  </table>
  <p><a href="{{appUrl}}/login" style="display:inline-block;background:#2563eb;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:500">Log in now</a></p>
  <p style="color:#999;font-size:13px;margin-top:24px">We recommend changing your password after your first login.</p>
</div>`,
    },
    {
      slug: "password-reset",
      name: "Password Reset",
      description: "Sent when a user requests a password reset",
      subject: "Reset your {{appName}} password",
      variables: ["name", "resetUrl", "appName", "expiryMinutes"],
      bodyHtml: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto">
  <h2 style="color:#333">Password Reset</h2>
  <p>Hi {{name}}, we received a request to reset your password.</p>
  <p><a href="{{resetUrl}}" style="display:inline-block;background:#2563eb;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:500">Reset Password</a></p>
  <p style="color:#999;font-size:13px;margin-top:24px">This link expires in {{expiryMinutes}} minutes. If you didn't request this, ignore this email.</p>
</div>`,
    },
    {
      slug: "action-item-assigned",
      name: "Action Item Assigned",
      description: "Sent when an action item is assigned to a user",
      subject: "New action item: {{title}}",
      variables: ["name", "title", "description", "dueDate", "assignedBy", "appUrl", "appName"],
      bodyHtml: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto">
  <h2 style="color:#333">New Action Item</h2>
  <p>Hi {{name}}, <strong>{{assignedBy}}</strong> assigned you a new task:</p>
  <div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin:16px 0">
    <p style="font-weight:bold;margin:0 0 8px">{{title}}</p>
    <p style="color:#666;margin:0 0 8px">{{description}}</p>
    <p style="color:#999;font-size:13px;margin:0">Due: {{dueDate}}</p>
  </div>
  <p><a href="{{appUrl}}/action-items" style="display:inline-block;background:#2563eb;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:500">View Action Items</a></p>
</div>`,
    },
    {
      slug: "action-item-reminder",
      name: "Action Item Reminder",
      description: "Daily reminder for pending action items",
      subject: "Reminder: {{title}} is due {{dueDate}}",
      variables: ["name", "title", "dueDate", "appUrl", "appName"],
      bodyHtml: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto">
  <h2 style="color:#333">Action Item Reminder</h2>
  <p>Hi {{name}}, this is a reminder about your task:</p>
  <div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin:16px 0">
    <p style="font-weight:bold;margin:0 0 8px">{{title}}</p>
    <p style="color:#999;font-size:13px;margin:0">Due: {{dueDate}}</p>
  </div>
  <p><a href="{{appUrl}}/action-items" style="display:inline-block;background:#2563eb;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:500">View Action Items</a></p>
</div>`,
    },
    {
      slug: "mention",
      name: "Mention Notification",
      description: "Sent when a user is @mentioned",
      subject: "{{mentionedBy}} mentioned you",
      variables: ["name", "mentionedBy", "context", "appUrl", "appName"],
      bodyHtml: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto">
  <h2 style="color:#333">You were mentioned</h2>
  <p>Hi {{name}}, <strong>{{mentionedBy}}</strong> mentioned you:</p>
  <blockquote style="border-left:3px solid #2563eb;padding:8px 16px;margin:16px 0;color:#555">{{context}}</blockquote>
  <p><a href="{{appUrl}}" style="display:inline-block;background:#2563eb;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:500">View in BDaily</a></p>
</div>`,
    },
    {
      slug: "report-comment",
      name: "Report Comment",
      description: "Sent when someone comments on a daily report",
      subject: "{{commenter}} commented on your report",
      variables: ["name", "commenter", "comment", "reportDate", "appUrl", "appName"],
      bodyHtml: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto">
  <h2 style="color:#333">New Comment on Your Report</h2>
  <p>Hi {{name}}, <strong>{{commenter}}</strong> commented on your {{reportDate}} report:</p>
  <blockquote style="border-left:3px solid #2563eb;padding:8px 16px;margin:16px 0;color:#555">{{comment}}</blockquote>
  <p><a href="{{appUrl}}" style="display:inline-block;background:#2563eb;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:500">View Report</a></p>
</div>`,
    },
  ];

  console.log("\nSeeding email templates...");
  for (const t of templates) {
    await prisma.emailTemplate.upsert({
      where: { slug: t.slug },
      update: { name: t.name, description: t.description, variables: t.variables },
      create: t,
    });
    console.log(`  Template: ${t.slug}`);
  }

  console.log("\n✓ Seed complete. All accounts use password: test1234");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
