/**
 * Native-style bottom tab bar (U4 Trainee Mobile, TS-1, NAV-1).
 * Restyled from the bottom nav pattern proven in the U3-era temporary
 * bridge, using shared design tokens instead of ad hoc classes.
 */
import { Bot, Calendar, Home, User } from 'lucide-react';
import { cn } from '../../shared/primitives/cn';
import { haptic } from '../../shared/primitives/haptics';

export type MobileTabKey = 'overview' | 'booking' | 'coach' | 'profile';

export interface BottomTabBarProps {
  active: MobileTabKey;
  onChange: (tab: MobileTabKey) => void;
}

const TABS: { key: MobileTabKey; icon: React.ReactNode; label: string }[] = [
  { key: 'overview', icon: <Home className="w-5 h-5" />, label: 'Tổng quan' },
  { key: 'booking', icon: <Calendar className="w-5 h-5" />, label: 'Đặt lịch' },
  { key: 'coach', icon: <Bot className="w-5 h-5" />, label: 'AI Coach' },
  { key: 'profile', icon: <User className="w-5 h-5" />, label: 'Hồ sơ' },
];

export function BottomTabBar({ active, onChange }: BottomTabBarProps) {
  return (
    <nav
      className="shrink-0 bg-black/95 backdrop-blur-md border-t border-white/10 flex items-stretch"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {TABS.map((tab) => (
        <button
          key={tab.key}
          type="button"
          data-testid={`mobile-tab-${tab.key}`}
          data-tour={`mobile-tab-${tab.key}`}
          onClick={() => { haptic(); onChange(tab.key); }}
          className={cn(
            'flex-1 flex flex-col items-center justify-center gap-1 py-2.5',
            'transition-[color,transform] duration-[var(--motion-fast)] active:scale-[0.92]',
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
