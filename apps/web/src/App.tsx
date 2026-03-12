import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import { LoginPage } from "@/pages/LoginPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { DailyFormPage } from "@/pages/DailyFormPage";
import { PersonSummaryPage } from "@/pages/PersonSummaryPage";
import { SprintSummaryPage } from "@/pages/SprintSummaryPage";
import { TeamDashboardPage } from "@/pages/TeamDashboardPage";

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
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
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
