import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider, useAuth } from "@/app/context/AuthContext";
import { ScanProvider } from "@/app/context/ScanContext";
import { AuthenticatedLayout } from "@/app/layouts/AuthenticatedLayout";
import { LandingPage } from "@/app/pages/LandingPage";
import { LoginPage } from "@/app/pages/LoginPage";
import { RegisterPage } from "@/app/pages/RegisterPage";
import { DashboardPage } from "@/app/pages/DashboardPage";
import { NewScanPage } from "@/app/pages/NewScanPage";
import { ScanDetailsPage } from "@/app/pages/ScanDetailsPage";
import { ScanHistoryPage } from "@/app/pages/ScanHistoryPage";
import { ReportsPage } from "@/app/pages/ReportsPage";
import { ProfilePage } from "@/app/pages/ProfilePage";
import { NotFoundPage } from "@/app/pages/NotFoundPage";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[color:var(--color-bg)]">
        <div className="text-[color:var(--color-muted)] text-sm">Loading…</div>
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function PublicOnly({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ScanProvider>
          <Toaster
            theme="dark"
            position="top-right"
            toastOptions={{
              style: {
                background: "#0f172a",
                border: "1px solid #334155",
                color: "#f8fafc",
              },
            }}
          />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route
              path="/login"
              element={
                <PublicOnly>
                  <LoginPage />
                </PublicOnly>
              }
            />
            <Route
              path="/register"
              element={
                <PublicOnly>
                  <RegisterPage />
                </PublicOnly>
              }
            />
            <Route
              element={
                <ProtectedRoute>
                  <AuthenticatedLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/scans/new" element={<NewScanPage />} />
              <Route path="/scans/history" element={<ScanHistoryPage />} />
              <Route path="/scans/:scanId" element={<ScanDetailsPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </ScanProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
