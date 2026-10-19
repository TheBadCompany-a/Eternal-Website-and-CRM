import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { queryClient } from './lib/queryClient';
import { AuthProvider } from './auth/AuthContext';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { LoginPage } from './components/auth/LoginPage';
import { TopHeader } from './components/layout/TopHeader';
import { CrmPortal } from './components/crm/CrmPortal';
import { useAuth } from './auth/useAuth';
import { homePath } from './auth/access';
import { useAppSettings } from './data/useSettings';
import { SharedConfiguratorScreen } from './components/crm/screens/SharedConfiguratorScreen';

/** Sends each person to their own starting screen (drivers go to the Driver App). */
function HomeRedirect() {
  const { profile, loading } = useAuth();
  const { settings } = useAppSettings();
  if (loading) return null;
  return <Navigate to={homePath(profile?.app_role, settings.role_access)} replace />;
}

function AppShell() {
  const { settings } = useAppSettings();
  return (
    <>
      <div className="app-container">
        <TopHeader />

        <Routes>
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/login/:portal" element={<Navigate to="/login" replace />} />
          <Route path="/shared/:token" element={<SharedConfiguratorScreen />} />
          <Route path="/crm" element={<HomeRedirect />} />
          <Route
            path="/crm/:sidebarItem"
            element={
              <ProtectedRoute>
                <CrmPortal />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<HomeRedirect />} />
        </Routes>

        <footer style={{ marginTop: 40, textAlign: 'center', fontSize: '0.8rem', color: 'var(--ink-muted)', lineHeight: 1.6 }}>
          {settings.business.company_name} · 24-Hour Emergency Dispatch Line: {settings.business.emergency_line}
          <br />
          <em>"Technology handles the coordination. People handle the care."</em>
        </footer>
      </div>
    </>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <AppShell />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
