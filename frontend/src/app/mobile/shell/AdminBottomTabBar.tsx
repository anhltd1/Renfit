/**
 * Native-style bottom tab bar for the trainer mobile dashboard (U6 Trainer
 * Mobile, TR-2, SHELL-1). Sibling of U4's BottomTabBar — same visual/
 * interaction pattern, trainer-specific tab keys.
 */
import { CalendarDays, Users } from 'lucide-react';
import { cn } from '../../shared/primitives/cn';

export type AdminMobileTabKey = 'clients' | 'bookings';

export interface AdminBottomTabBarProps {
  active: AdminMobileTabKey;
  onChange: (tab: AdminMobileTabKey) => void;
}

const TABS: { key: AdminMobileTabKey; icon: React.ReactNode; label: string }[] = [
  { key: 'clients', icon: <Users className="w-5 h-5" />, label: 'Hội viên' },
  { key: 'bookings', icon: <CalendarDays className="w-5 h-5" />, label: 'Lịch đặt' },
];

export function AdminBottomTabBar({ active, onChange }: AdminBottomTabBarProps) {
  return (
    <nav
      className="shrink-0 bg-black/95 backdrop-blur-md border-t border-white/10 flex items-stretch"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {TABS.map((tab) => (
        <button
          key={tab.key}
          type="button"
          data-testid={`admin-mobile-tab-${tab.key}`}
          onClick={() => onChange(tab.key)}
          className={cn(
            'flex-1 flex flex-col items-center justify-center gap-1 py-2.5 transition-colors',
            active === tab.key ? 'text-[#0F6B3E]' : 'text-white/40',
          )}
        >
          {tab.icon}
          <span className="text-[10px] font-medium leading-none">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
