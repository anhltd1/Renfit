/**
 * Desktop admin dashboard header (U5 Trainer Desktop, EXT-1).
 * View toggle (clients/bookings), customer-count pill, refresh, notification
 * bell, and logout — same content as the combined component's header.
 */
import { CalendarDays, Home, LogOut, RefreshCw, ShieldCheck, Users } from 'lucide-react';
import { LiveClock } from '../../components/LiveClock';
import { TrainerNotificationBell } from '../../components/TrainerNotificationBell';

export interface DesktopAdminHeaderProps {
  view: 'today' | 'clients' | 'bookings';
  onViewChange: (view: 'today' | 'clients' | 'bookings') => void;
  customerCount: number;
  onRefresh: () => void;
  refreshing: boolean;
  onLogout: () => void;
}

export function DesktopAdminHeader({
  view,
  onViewChange,
  customerCount,
  onRefresh,
  refreshing,
  onLogout,
}: DesktopAdminHeaderProps) {
  return (
    <header
      className="shrink-0 bg-[#0A0A0A] border-b border-white/8 px-4 py-2.5 flex items-center justify-between gap-2"
      style={{ paddingTop: 'max(0.625rem, env(safe-area-inset-top))' }}
    >
      {/* Left */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-8 h-8 shrink-0 rounded-lg bg-[#0F6B3E]/20 border border-[#0F6B3E]/30 flex items-center justify-center">
          <ShieldCheck className="w-4 h-4 text-[#0F6B3E]" />
        </div>
        <div className="min-w-0">
          <span className="text-white font-bold text-sm">Renfit Admin</span>
          <span className="text-white/30 text-xs ml-2">Coach Dashboard</span>
        </div>

        {/* View tabs */}
        <div className="flex items-center gap-1 ml-4 bg-white/5 border border-white/8 rounded-lg p-0.5 shrink-0">
          <button
            type="button"
            data-testid="tab-today"
            onClick={() => onViewChange('today')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs transition-all ${
              view === 'today' ? 'bg-[#0F6B3E] text-white' : 'text-white/50 hover:text-white'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Hôm nay</span>
          </button>
          <button
            type="button"
            data-testid="tab-clients"
            onClick={() => onViewChange('clients')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs transition-all ${
              view === 'clients' ? 'bg-[#0F6B3E] text-white' : 'text-white/50 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Hội viên</span>
          </button>
          <button
            type="button"
            data-testid="tab-bookings"
            onClick={() => onViewChange('bookings')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs transition-all ${
              view === 'bookings' ? 'bg-[#0F6B3E] text-white' : 'text-white/50 hover:text-white'
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            <span>Lịch đặt</span>
          </button>
        </div>
      </div>

      {/* Center — live clock */}
      <div className="flex justify-center flex-1">
        <LiveClock />
      </div>

      {/* Right */}
      <div className="flex items-center gap-2 justify-end shrink-0">
        {view === 'clients' && (
          <div className="flex items-center gap-1 bg-white/5 border border-white/8 rounded-xl px-3 py-1.5 mr-2">
            <Users className="w-3.5 h-3.5 text-[#0F6B3E]" />
            <span className="text-white/60 text-sm">
              <span className="text-white font-semibold">{customerCount}</span> hội viên
            </span>
          </div>
        )}
        {view === 'clients' && (
          <button
            type="button"
            data-testid="button-refresh"
            onClick={onRefresh}
            disabled={refreshing}
            className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-all disabled:opacity-40"
            title="Làm mới"
            aria-label="Làm mới"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        )}
        <TrainerNotificationBell
          onNavigate={(v) => {
            if (v === 'today' || v === 'clients' || v === 'bookings') onViewChange(v);
          }}
        />
        <button
          type="button"
          data-testid="button-logout"
          onClick={onLogout}
          className="flex items-center gap-1.5 text-white/40 hover:text-red-400 transition-colors text-sm px-2 py-2 rounded-xl hover:bg-red-400/5"
        >
          <LogOut className="w-4 h-4" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </header>
  );
}
