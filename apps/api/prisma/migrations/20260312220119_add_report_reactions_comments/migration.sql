-- CreateTable
CREATE TABLE "report_reactions" (
    "id" UUID NOT NULL,
    "dailyReportId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "emoji" VARCHAR(8) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "report_reactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "report_comments" (
    "id" UUID NOT NULL,
    "dailyReportId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "parentId" UUID,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "report_comments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "report_reactions_dailyReportId_idx" ON "report_reactions"("dailyReportId");

-- CreateIndex
CREATE UNIQUE INDEX "report_reactions_dailyReportId_userId_emoji_key" ON "report_reactions"("dailyReportId", "userId", "emoji");

-- CreateIndex
CREATE INDEX "report_comments_dailyReportId_idx" ON "report_comments"("dailyReportId");

-- CreateIndex
CREATE INDEX "report_comments_parentId_idx" ON "report_comments"("parentId");

-- AddForeignKey
ALTER TABLE "report_reactions" ADD CONSTRAINT "report_reactions_dailyReportId_fkey" FOREIGN KEY ("dailyReportId") REFERENCES "daily_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_reactions" ADD CONSTRAINT "report_reactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_comments" ADD CONSTRAINT "report_comments_dailyReportId_fkey" FOREIGN KEY ("dailyReportId") REFERENCES "daily_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_comments" ADD CONSTRAINT "report_comments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_comments" ADD CONSTRAINT "report_comments_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "report_comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
