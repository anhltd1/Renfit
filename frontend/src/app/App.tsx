import { Routes, Route, useLocation, useNavigate } from 'react-router';
import { LandingPage } from './pages/LandingPage';
import { AIChatPage } from './pages/AIChatPage';
import { BookingPage } from './pages/BookingPage';
import { UserDashboardPage } from './pages/UserDashboardPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminGuard } from './components/AdminGuard';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AuthGuard } from './components/AuthGuard';

export type Page = '/' | '/ai-coach' | '/booking' | '/dashboard' | '/login' | '/signup' | '/profile' | '/admin' | '/admin/dashboard';

const VALID_PAGES: Page[] = ['/', '/ai-coach', '/booking', '/dashboard', '/login', '/signup', '/profile', '/admin', '/admin/dashboard'];

function isPage(path: string): path is Page {
  return VALID_PAGES.includes(path as Page);
}

/** Hook for legacy components — backed by React Router */
export function useNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPage: Page = isPage(location.pathname) ? location.pathname : '/';

  return {
    currentPage,
    navigate: (page: Page) => navigate(page),
  };
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/ai-coach"
        element={
          <AuthGuard>
            <ErrorBoundary>
              <AIChatPage />
            </ErrorBoundary>
          </AuthGuard>
        }
      />
      <Route
        path="/booking"
        element={
          <AuthGuard>
            <BookingPage />
          </AuthGuard>
        }
      />
      <Route path="/dashboard" element={<AuthGuard><UserDashboardPage /></AuthGuard>} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/admin" element={<AdminLoginPage />} />
      <Route
        path="/admin/dashboard"
        element={
          <AdminGuard>
            <AdminDashboardPage />
          </AdminGuard>
        }
      />
      <Route path="*" element={<LandingPage />} />
    </Routes>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-[#0B0B0B]">
      <AppRoutes />
    </div>
  );
}
