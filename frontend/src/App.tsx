import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { AppShell } from "./components/AppShell";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { DashboardPage } from "./pages/DashboardPage";
import { EmergencyPage } from "./pages/EmergencyPage";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { RecordsPage } from "./pages/RecordsPage";
import { StaffAdminPage } from "./pages/StaffAdminPage";
import { SymptomCheckerPage } from "./pages/SymptomCheckerPage";
import { AppointmentsPage } from "./pages/AppointmentsPage";
import { ProfilePage } from "./pages/ProfilePage";
import { DoctorWorkspacePage } from "./pages/DoctorWorkspacePage";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<AppShell />}>
              <Route path="/dashboard" element={<DashboardPage />} />

              <Route element={<ProtectedRoute allowedRoles={["STUDENT"]} />}>
                <Route path="/symptom-checker" element={<SymptomCheckerPage />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={["DOCTOR"]} />}>
                <Route path="/workspace" element={<DoctorWorkspacePage />} />
              </Route>

              <Route path="/appointments" element={<AppointmentsPage />} />
              <Route path="/records" element={<RecordsPage />} />
              <Route path="/emergency" element={<EmergencyPage />} />
              <Route path="/profile" element={<ProfilePage />} />

              <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
                <Route path="/staff" element={<StaffAdminPage />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
