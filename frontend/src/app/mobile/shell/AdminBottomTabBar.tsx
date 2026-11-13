/**
 * Native-style bottom tab bar for the trainer mobile dashboard (U6 Trainer
 * Mobile, TR-2, SHELL-1). Sibling of U4's BottomTabBar — same visual/
 * interaction pattern, trainer-specific tab keys.
 */
import { CalendarDays, Home, Layout, Users } from 'lucide-react';
import { cn } from '../../shared/primitives/cn';
import { haptic } from '../../shared/primitives/haptics';

export type AdminMobileTabKey = 'today' | 'clients' | 'bookings' | 'cms';

export interface AdminBottomTabBarProps {
  active: AdminMobileTabKey;
  onChange: (tab: AdminMobileTabKey) => void;
}

const TABS: { key: AdminMobileTabKey; icon: React.ReactNode; label: string }[] = [
  { key: 'today', icon: <Home className="w-5 h-5" />, label: 'Hôm nay' },
  { key: 'clients', icon: <Users className="w-5 h-5" />, label: 'Hội viên' },
  { key: 'bookings', icon: <CalendarDays className="w-5 h-5" />, label: 'Lịch đặt' },
  { key: 'cms', icon: <Layout className="w-5 h-5" />, label: 'Trang chủ' },
];

export function AdminBottomTabBar({ active, onChange }: AdminBottomTabBarProps) {
  return (
    <nav
      aria-label="Điều hướng chính"
      className="app-chrome shrink-0 bg-[#0B0B0B] border-t border-line flex items-stretch"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {TABS.map((tab) => (
        <button
          key={tab.key}
          type="button"
          data-testid={`admin-mobile-tab-${tab.key}`}
          aria-current={active === tab.key ? 'page' : undefined}
          onClick={() => { haptic(); onChange(tab.key); }}
          className={cn(
            'relative flex-1 min-h-14 flex flex-col items-center justify-center gap-1 py-2',
            'transition-[color,transform] duration-[var(--motion-fast)] active:scale-[0.92]',
            active === tab.key ? 'text-white' : 'text-white/64',
          )}
        >
          {active === tab.key && (
            <span aria-hidden="true" className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-primary-text" />
          )}
          {tab.icon}
          <span className="text-xs font-medium leading-none">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
