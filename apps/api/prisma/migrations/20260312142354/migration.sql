-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'MEMBER');

-- CreateEnum
CREATE TYPE "TicketSystemType" AS ENUM ('YOUTRACK', 'JIRA', 'LINEAR');

-- CreateEnum
CREATE TYPE "CompletedItemType" AS ENUM ('TASK', 'BUG_FIX');

-- CreateEnum
CREATE TYPE "CompletedItemStatus" AS ENUM ('COMPLETED', 'MERGED', 'DEPLOYED');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('PRIMARY', 'SECONDARY');

-- CreateEnum
CREATE TYPE "BlockerType" AS ENUM ('TECHNICAL', 'DEPENDENCY');

-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('TECHNICAL', 'PRODUCT', 'PROCESS');

-- CreateEnum
CREATE TYPE "TestResult" AS ENUM ('APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "role" "Role" NOT NULL DEFAULT 'MEMBER',
    "ticketSystemToken" TEXT,
    "teamId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teams" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "ticketSystemType" "TicketSystemType" NOT NULL,
    "ticketSystemConfig" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_reports" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "date" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "daily_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "completed_items" (
    "id" UUID NOT NULL,
    "dailyReportId" UUID NOT NULL,
    "type" "CompletedItemType" NOT NULL,
    "ticketId" TEXT,
    "title" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "status" "CompletedItemStatus" NOT NULL,
    "prLink" TEXT,
    "commitHash" TEXT,
    "rootCause" TEXT,
    "solution" TEXT,
    "impact" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "completed_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "today_items" (
    "id" UUID NOT NULL,
    "dailyReportId" UUID NOT NULL,
    "priority" "Priority" NOT NULL,
    "ticketId" TEXT,
    "title" TEXT NOT NULL,
    "goal" TEXT,
    "approach" TEXT,
    "etaToDev" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "today_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blockers" (
    "id" UUID NOT NULL,
    "dailyReportId" UUID NOT NULL,
    "type" "BlockerType" NOT NULL,
    "description" TEXT NOT NULL,
    "impact" TEXT,
    "need" TEXT,
    "waitingFor" TEXT,
    "expectedResolution" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blockers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "additional_notes" (
    "id" UUID NOT NULL,
    "dailyReportId" UUID NOT NULL,
    "codeReviewRequests" TEXT,
    "testingStatus" TEXT,
    "deploymentNotes" TEXT,
    "learningResearch" TEXT,

    CONSTRAINT "additional_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "questions" (
    "id" UUID NOT NULL,
    "dailyReportId" UUID NOT NULL,
    "type" "QuestionType" NOT NULL,
    "content" TEXT NOT NULL,

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tested_tickets" (
    "id" UUID NOT NULL,
    "dailyReportId" UUID NOT NULL,
    "ticketId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "result" "TestResult" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tested_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "daily_reports_userId_date_key" ON "daily_reports"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "additional_notes_dailyReportId_key" ON "additional_notes"("dailyReportId");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_reports" ADD CONSTRAINT "daily_reports_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "completed_items" ADD CONSTRAINT "completed_items_dailyReportId_fkey" FOREIGN KEY ("dailyReportId") REFERENCES "daily_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "today_items" ADD CONSTRAINT "today_items_dailyReportId_fkey" FOREIGN KEY ("dailyReportId") REFERENCES "daily_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blockers" ADD CONSTRAINT "blockers_dailyReportId_fkey" FOREIGN KEY ("dailyReportId") REFERENCES "daily_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "additional_notes" ADD CONSTRAINT "additional_notes_dailyReportId_fkey" FOREIGN KEY ("dailyReportId") REFERENCES "daily_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_dailyReportId_fkey" FOREIGN KEY ("dailyReportId") REFERENCES "daily_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tested_tickets" ADD CONSTRAINT "tested_tickets_dailyReportId_fkey" FOREIGN KEY ("dailyReportId") REFERENCES "daily_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;
