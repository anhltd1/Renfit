/**
 * Desktop customer dashboard — Overview, AI Coach, Bookings in one shell
 * (U3 Trainee Desktop, TS-2/TS-4/TS-6/TS-8).
 *
 * Rebuilt from the combined desktop+mobile UserDashboardPage.tsx: this file
 * covers the DESKTOP presentation only (mobile lives in app/mobile/pages,
 * selected at the route entry via useDevice() — see DashboardRoute.tsx).
 * Behavior (tabs, onboarding, notifications, booking, chat) is unchanged;
 * profile/InBody now go through the U2 shared hooks (useProfile,
 * useInbodyHistory) instead of direct API calls.
 */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { ChatPanel } from '../../components/chat/ChatPanel';
import { OnboardingTour, type OnboardingTab } from '../../components/OnboardingTour';
import { consumeNewAccountFlag, clearAuthUser } from '../../../lib/auth';
import { useProfile } from '../../shared/hooks/useProfile';
import { DesktopSidebar, type DashboardTab } from '../components/DesktopSidebar';
import { DesktopHeader } from '../components/DesktopHeader';
import { OverviewTab } from '../components/OverviewTab';
import { BookingTab } from '../components/BookingTab';

export function UserDashboardPage() {
  const navigate = useNavigate();
  const { user } = useProfile();
  const [tab, setTab] = useState<DashboardTab>('overview');
  const [chatKey, setChatKey] = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Checked once on mount — see original UserDashboardPage.tsx comment for
  // why this uses an effect (StrictMode double-invoke safety) rather than a
  // lazy useState initializer.
  useEffect(() => {
    if (consumeNewAccountFlag()) setShowOnboarding(true);
  }, []);

  const handleLogout = () => {
    clearAuthUser();
    navigate('/');
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="h-[100dvh] w-full flex overflow-hidden bg-[#0B0B0B] text-white">
      <DesktopSidebar
        user={user}
        activeTab={tab}
        onTabChange={setTab}
        onNewChat={() => setChatKey((k) => k + 1)}
        onLogout={handleLogout}
      />

      <main className="flex-1 min-w-0 flex flex-col min-h-0">
        <DesktopHeader
          tab={tab}
          customerId={user.id}
          onNavigateFromNotification={(t) => {
            if (t === 'overview' || t === 'chat' || t === 'bookings') setTab(t);
          }}
        />

        {/* Tab content stays mounted (hidden) so chat history/scroll survive tab switches. */}
        <div className="flex-1 min-h-0 overflow-y-auto" style={{ display: tab === 'overview' ? 'block' : 'none' }}>
          <OverviewTab />
        </div>
        <div className="flex-1 min-h-0 flex flex-col" style={{ display: tab === 'chat' ? 'flex' : 'none' }}>
          <ChatPanel key={chatKey} variant="full" showHeader={false} />
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto" style={{ display: tab === 'bookings' ? 'block' : 'none' }}>
          <BookingTab user={user} />
        </div>
      </main>

      {showOnboarding && (
        <OnboardingTour
          onTabChange={(t: OnboardingTab) => setTab(t)}
          onFinish={() => {
            setShowOnboarding(false);
            setTab('overview');
          }}
        />
      )}
    </div>
  );
}
