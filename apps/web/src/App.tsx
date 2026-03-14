import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import { LoginPage } from "@/pages/LoginPage";
import { ForgotPasswordPage } from "@/pages/ForgotPasswordPage";
import { ResetPasswordPage } from "@/pages/ResetPasswordPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { DailyFormPage } from "@/pages/DailyFormPage";
import { PersonSummaryPage } from "@/pages/PersonSummaryPage";
import { SprintSummaryPage } from "@/pages/SprintSummaryPage";
import { TeamDashboardPage } from "@/pages/TeamDashboardPage";
import { TeamBoardPage } from "@/pages/TeamBoardPage";
import { TeamDailyPage } from "@/pages/TeamDailyPage";
import { MemberReportView } from "@/pages/MemberReportView";
import { ReportDetailPage } from "@/pages/ReportDetailPage";
import { ActionItemsPage } from "@/pages/ActionItemsPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { TeamsPage } from "@/pages/admin/TeamsPage";
import { TeamDetailPage } from "@/pages/admin/TeamDetailPage";
import { BrandingPage } from "@/pages/admin/BrandingPage";
import { EmailTemplatesPage } from "@/pages/admin/EmailTemplatesPage";

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<DashboardPage />} />
        <Route path="/daily" element={<DailyFormPage />} />
        <Route path="/daily/:date" element={<DailyFormPage />} />
        <Route path="/summary/me" element={<PersonSummaryPage />} />
        <Route path="/summary/sprint/:sprintId" element={<SprintSummaryPage />} />
        <Route path="/team" element={<TeamDashboardPage />} />
        <Route path="/board" element={<TeamBoardPage />} />
        <Route path="/board/daily" element={<TeamDailyPage />} />
        <Route path="/board/:userId" element={<MemberReportView />} />
        <Route path="/board/:userId/:date" element={<ReportDetailPage />} />
        <Route path="/action-items" element={<ActionItemsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/admin/teams" element={<TeamsPage />} />
        <Route path="/admin/teams/:id" element={<TeamDetailPage />} />
        <Route path="/admin/teams/:id/branding" element={<BrandingPage />} />
        <Route path="/admin/email-templates" element={<EmailTemplatesPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
