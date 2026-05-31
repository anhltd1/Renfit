import { Routes, Route, useLocation, useNavigate } from 'react-router';
import { LandingPage } from './pages/LandingPage';
import { AIChatPage } from './pages/AIChatPage';
import { BookingPage } from './pages/BookingPage';
import { DashboardPage } from './pages/DashboardPage';
import { ErrorBoundary } from './components/ErrorBoundary';

export type Page = '/' | '/ai-coach' | '/booking' | '/dashboard';

const VALID_PAGES: Page[] = ['/', '/ai-coach', '/booking', '/dashboard'];

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
          <ErrorBoundary>
            <AIChatPage />
          </ErrorBoundary>
        }
      />
      <Route path="/booking" element={<BookingPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
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
