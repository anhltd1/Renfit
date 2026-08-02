/**
 * Desktop dashboard header (U3 Trainee Desktop, TS-2).
 * Rebuilt from the header previously inlined in UserDashboardPage.tsx.
 */
import { Bot, CalendarDays, Sparkles, User } from 'lucide-react';
import { LiveClock } from '../../components/LiveClock';
import { NotificationBell } from '../../components/NotificationBell';
import type { DashboardTab } from './DesktopSidebar';

export interface DesktopHeaderProps {
  tab: DashboardTab;
  customerId: string;
  onNavigateFromNotification: (tab: string) => void;
}

export function DesktopHeader({ tab, customerId, onNavigateFromNotification }: DesktopHeaderProps) {
  return (
    <header
      className="shrink-0 bg-black/80 backdrop-blur-md border-b border-white/10 px-4 md:px-6 py-3 md:py-4 flex items-center gap-2"
      style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}
    >
      {/* Left — page title */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {tab === 'overview' && (
          <>
            <User className="w-5 h-5 text-[#0F6B3E] shrink-0" />
            <h1 className="text-white font-bold truncate">Hồ sơ & Thể trạng</h1>
          </>
        )}
        {tab === 'chat' && (
          <>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#0F6B3E] to-[#0F6B3E]/60 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-white font-bold truncate">Renfit AI Coach</h1>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                <span className="text-white/50 text-xs">Đang hoạt động</span>
              </div>
            </div>
            <div className="ml-auto hidden sm:flex items-center gap-2 bg-[#0F6B3E]/20 px-3 py-1.5 rounded-full border border-[#0F6B3E]/30 shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-[#0F6B3E]" />
              <span className="text-[#0F6B3E] text-xs">AI-Powered</span>
            </div>
          </>
        )}
        {tab === 'bookings' && (
          <>
            <CalendarDays className="w-5 h-5 text-[#0F6B3E] shrink-0" />
            <h1 className="text-white font-bold truncate">Đặt Lịch Tập</h1>
          </>
        )}
      </div>

      {/* Center — live clock */}
      <div className="hidden md:flex justify-center flex-1">
        <LiveClock />
      </div>

      {/* Right — notifications */}
      <div className="flex justify-end shrink-0">
        <div data-tour="header-notifications" className="inline-flex">
          <NotificationBell customerId={customerId} onNavigate={onNavigateFromNotification} />
        </div>
      </div>
    </header>
  );
}
