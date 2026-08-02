/**
 * Desktop dashboard sidebar (U3 Trainee Desktop, TS-2).
 * Rebuilt from the sidebar previously inlined in UserDashboardPage.tsx —
 * same structure and behavior, using shared primitives for the nav buttons.
 */
import { Bot, Calendar, LogOut, Plus, User } from 'lucide-react';
import { Link } from '../../components/Link';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import logoImage from '../../../imports/image.png';
import { cn } from '../../shared/primitives/cn';
import type { AuthUser } from '../../../lib/auth';

export type DashboardTab = 'overview' | 'chat' | 'bookings';

export interface DesktopSidebarProps {
  user: AuthUser;
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
  onNewChat: () => void;
  onLogout: () => void;
}

const NAV_ITEMS: { key: DashboardTab; icon: React.ReactNode; label: string; tour: string }[] = [
  { key: 'overview', icon: <User className="w-4 h-4" />, label: 'Hồ sơ & InBody', tour: 'sidebar-profile' },
  { key: 'chat', icon: <Bot className="w-4 h-4" />, label: 'AI Coach', tour: 'sidebar-chat' },
  { key: 'bookings', icon: <Calendar className="w-4 h-4" />, label: 'Đặt lịch tập', tour: 'sidebar-bookings' },
];

export function DesktopSidebar({ user, activeTab, onTabChange, onNewChat, onLogout }: DesktopSidebarProps) {
  return (
    <aside className="hidden md:w-64 md:flex lg:w-72 shrink-0 flex-col bg-black border-r border-white/10">
      {/* Logo */}
      <div className="p-5 border-b border-white/10">
        <Link to="/" className="flex items-center gap-3">
          <ImageWithFallback src={logoImage} alt="Renfit" className="h-9 w-auto" />
        </Link>
      </div>

      {/* User identity */}
      <div className="p-4 border-b border-white/8">
        <div className="flex items-center gap-3 bg-white/5 rounded-xl p-3">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.id}
              className="w-10 h-10 rounded-full object-cover border border-white/20 shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-[#0F6B3E]/20 border border-[#0F6B3E]/30 flex items-center justify-center shrink-0">
              <User className="w-5 h-5 text-[#0F6B3E]" />
            </div>
          )}
          <div className="min-w-0">
            <p className="text-white text-sm font-medium truncate">{user.id}</p>
            <p className="text-white/35 text-xs truncate">{user.phone_number}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {NAV_ITEMS.map((item) => (
          <div key={item.key} data-tour={item.tour}>
            <button
              type="button"
              data-testid={`sidebar-nav-${item.key}`}
              onClick={() => onTabChange(item.key)}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all',
                activeTab === item.key
                  ? 'bg-[#0F6B3E]/20 border border-[#0F6B3E]/30 text-[#0F6B3E]'
                  : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent',
              )}
            >
              {item.icon}
              {item.label}
            </button>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-white/8 space-y-1.5">
        {activeTab === 'chat' && (
          <button
            type="button"
            data-testid="sidebar-new-chat"
            onClick={onNewChat}
            className="w-full bg-[#0F6B3E]/15 hover:bg-[#0F6B3E]/25 border border-[#0F6B3E]/30 text-[#0F6B3E] py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all text-sm"
          >
            <Plus className="w-4 h-4" /> Cuộc trò chuyện mới
          </button>
        )}
        <button
          type="button"
          data-testid="sidebar-logout"
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 text-white/40 hover:text-red-400 py-2 text-sm transition-colors rounded-xl hover:bg-red-400/5"
        >
          <LogOut className="w-4 h-4" /> Đăng xuất
        </button>
      </div>
    </aside>
  );
}
