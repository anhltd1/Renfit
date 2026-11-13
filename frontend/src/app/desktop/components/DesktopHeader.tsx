/**
 * Desktop member dashboard header — DESIGN.md v2.
 * One noun title per tab at 24px with the gym-local time beside it; the
 * notification bell on the right. No icon chips, no "AI-Powered" badge.
 */
import { LiveClock } from '../../components/LiveClock';
import { NotificationBell } from '../../components/NotificationBell';
import type { DashboardTab } from './DesktopSidebar';

export interface DesktopHeaderProps {
  tab: DashboardTab;
  customerId: string;
  onNavigateFromNotification: (tab: string) => void;
}

export const DESKTOP_TAB_TITLES: Record<DashboardTab, string> = {
  home: 'Tổng quan',
  overview: 'Hồ sơ & InBody',
  chat: 'AI Coach',
  bookings: 'Đặt lịch tập',
};

export function DesktopHeader({ tab, customerId, onNavigateFromNotification }: DesktopHeaderProps) {
  return (
    <header
      className="shrink-0 bg-[#0B0B0B] border-b border-line px-6 lg:px-8 h-16 flex items-center gap-4"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="flex items-baseline gap-4 flex-1 min-w-0">
        <h1 className="text-white text-2xl font-semibold leading-tight truncate">{DESKTOP_TAB_TITLES[tab]}</h1>
        <div className="hidden md:block">
          <LiveClock />
        </div>
      </div>
      <div data-tour="header-notifications" className="inline-flex shrink-0">
        <NotificationBell customerId={customerId} onNavigate={onNavigateFromNotification} />
      </div>
    </header>
  );
}
