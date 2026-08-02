import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router';
import { AdminGuard } from './components/AdminGuard';
import { AuthGuard } from './components/AuthGuard';
import { LazyLoadFallback } from './components/LazyLoadFallback';
import { DeviceProvider } from './device/DeviceProvider';

/**
 * Route-level code-splitting (U7 Performance & PWA, SPLIT-1). Each top-level
 * route element is its own dynamic import chunk, so a session only
 * downloads the page(s) it actually visits — and since each device-split
 * `*Route.tsx` internally imports its desktop/mobile page module, Vite's
 * module graph further splits those into separate chunks automatically
 * (SPLIT-2) without a second explicit lazy layer.
 */
const LandingPage = lazy(() => import('./pages/LandingPage').then((m) => ({ default: m.LandingPage })));
const DashboardRoute = lazy(() => import('./pages/DashboardRoute').then((m) => ({ default: m.DashboardRoute })));
const LoginRoute = lazy(() => import('./pages/LoginRoute').then((m) => ({ default: m.LoginRoute })));
const SignupRoute = lazy(() => import('./pages/SignupRoute').then((m) => ({ default: m.SignupRoute })));
const AdminLoginRoute = lazy(() => import('./pages/AdminLoginRoute').then((m) => ({ default: m.AdminLoginRoute })));
const AdminDashboardRoute = lazy(() =>
  import('./pages/AdminDashboardRoute').then((m) => ({ default: m.AdminDashboardRoute })),
);

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
    <Suspense fallback={<LazyLoadFallback />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/ai-coach" element={<Navigate to="/dashboard" replace />} />
        <Route path="/booking" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<AuthGuard><DashboardRoute /></AuthGuard>} />
        <Route path="/login" element={<LoginRoute />} />
        <Route path="/signup" element={<SignupRoute />} />
        <Route path="/profile" element={<Navigate to="/dashboard" replace />} />
        <Route path="/admin" element={<AdminLoginRoute />} />
        <Route
          path="/admin/dashboard"
          element={
            <AdminGuard>
              <AdminDashboardRoute />
            </AdminGuard>
          }
        />
        <Route path="*" element={<LandingPage />} />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <DeviceProvider>
      <div className="min-h-screen bg-[#0B0B0B]">
        <AppRoutes />
      </div>
    </DeviceProvider>
  );
}
