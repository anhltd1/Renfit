/**
 * Desktop member sidebar — DESIGN.md v2 "Navigation".
 * On the page ground with a 1px rule; product mark at the top, labelled nav
 * (active = neutral pill, never green), account row at the bottom.
 */
import { Bot, Calendar, Home, LogOut, Plus, User } from 'lucide-react';
import { Link } from '../../components/Link';
import { BrandMark } from '../../shared/components/BrandMark';
import { cn } from '../../shared/primitives/cn';
import type { AuthUser } from '../../../lib/auth';

export type DashboardTab = 'home' | 'overview' | 'chat' | 'bookings';

export interface DesktopSidebarProps {
  user: AuthUser;
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
  onNewChat: () => void;
  onLogout: () => void;
}

const NAV_ITEMS: { key: DashboardTab; Icon: typeof Home; label: string; tour: string }[] = [
  { key: 'home', Icon: Home, label: 'Tổng quan', tour: 'sidebar-home' },
  { key: 'bookings', Icon: Calendar, label: 'Đặt lịch tập', tour: 'sidebar-bookings' },
  { key: 'overview', Icon: User, label: 'Hồ sơ & InBody', tour: 'sidebar-profile' },
  { key: 'chat', Icon: Bot, label: 'AI Coach', tour: 'sidebar-chat' },
];

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return (parts.length > 1 ? parts[parts.length - 1][0] : parts[0]?.[0] ?? '?').toUpperCase();
}

export function DesktopSidebar({ user, activeTab, onTabChange, onNewChat, onLogout }: DesktopSidebarProps) {
  return (
    <aside className="hidden md:flex w-60 shrink-0 flex-col bg-[#0B0B0B] border-r border-line">
      <div className="h-16 px-5 flex items-center border-b border-line">
        <Link to="/" className="rounded-control" aria-label="Renfit — trang chủ">
          <BrandMark scope="Hội viên" />
        </Link>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5" aria-label="Điều hướng">
        {NAV_ITEMS.map(({ key, Icon, label, tour }) => {
          const active = activeTab === key;
          return (
            <div key={key} data-tour={tour}>
              <button
                type="button"
                data-testid={`sidebar-nav-${key}`}
                aria-current={active ? 'page' : undefined}
                onClick={() => onTabChange(key)}
                className={cn(
                  'w-full h-9 flex items-center gap-2.5 px-3 rounded-control text-sm transition-colors duration-[var(--motion-fast)]',
                  active ? 'bg-surface-2 text-white font-medium' : 'text-white/64 hover:text-white hover:bg-surface',
                )}
              >
                <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                {label}
              </button>
            </div>
          );
        })}

        {activeTab === 'chat' && (
          <button
            type="button"
            data-testid="sidebar-new-chat"
            onClick={onNewChat}
            className="mt-3 w-full h-9 flex items-center gap-2.5 px-3 rounded-control text-sm text-white/64 border border-dashed border-line-strong hover:text-white hover:bg-surface transition-colors"
          >
            <Plus className="w-4 h-4" aria-hidden="true" /> Cuộc trò chuyện mới
          </button>
        )}
      </nav>

      <div className="p-3 border-t border-line flex items-center gap-3">
        {user.avatar ? (
          <img src={user.avatar} alt="" className="w-9 h-9 rounded-full object-cover shrink-0" />
        ) : (
          <span
            aria-hidden="true"
            className="w-9 h-9 rounded-full bg-surface-2 border border-line text-white/80 text-sm font-semibold flex items-center justify-center shrink-0"
          >
            {initials(user.id)}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-white text-sm font-medium truncate">{user.id}</p>
          <p className="text-white/64 text-xs truncate tabular-nums">{user.phone_number}</p>
        </div>
        <button
          type="button"
          data-testid="sidebar-logout"
          onClick={onLogout}
          aria-label="Đăng xuất"
          title="Đăng xuất"
          className="w-8 h-8 shrink-0 inline-flex items-center justify-center rounded-control text-white/64 hover:text-error-text hover:bg-surface transition-colors"
        >
          <LogOut className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </aside>
  );
}
