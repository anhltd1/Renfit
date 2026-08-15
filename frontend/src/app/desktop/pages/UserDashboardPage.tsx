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
import { MemberHomeDashboard } from '../components/MemberHomeDashboard';
import { TabPanel } from '../../shared/primitives/TabPanel';

export function UserDashboardPage() {
  const navigate = useNavigate();
  const { user } = useProfile();
  const [tab, setTab] = useState<DashboardTab>('home');
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
            if (t === 'home' || t === 'overview' || t === 'chat' || t === 'bookings') setTab(t);
          }}
        />

        {/* Tab content stays mounted (hidden) so chat history/scroll survive tab
            switches; TabPanel adds the fade-in that plain display toggling can't. */}
        <TabPanel active={tab === 'home'} className="flex-1 min-h-0 overflow-y-auto">
          <MemberHomeDashboard user={user} onNavigateTab={(t) => setTab(t as DashboardTab)} />
        </TabPanel>
        <TabPanel active={tab === 'overview'} className="flex-1 min-h-0 overflow-y-auto">
          <OverviewTab />
        </TabPanel>
        <TabPanel active={tab === 'chat'} display="flex" className="flex-1 min-h-0 flex-col">
          <ChatPanel key={chatKey} variant="full" showHeader={false} />
        </TabPanel>
        <TabPanel active={tab === 'bookings'} className="flex-1 min-h-0 overflow-y-auto">
          <BookingTab user={user} />
        </TabPanel>
      </main>

      {showOnboarding && (
        <OnboardingTour
          onTabChange={(t: OnboardingTab) => setTab(t)}
          onFinish={() => {
            setShowOnboarding(false);
            setTab('home');
          }}
        />
      )}
    </div>
  );
}
