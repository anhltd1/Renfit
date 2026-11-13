/**
 * Native-style bottom tab bar (U4 Trainee Mobile, TS-1, NAV-1).
 * DESIGN.md v2: on the page ground; the active tab is white with a 2px
 * green indicator above it — green marks the state, it doesn't paint the chrome.
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
      aria-label="Điều hướng chính"
      className="app-chrome shrink-0 bg-[#0B0B0B] border-t border-line flex items-stretch"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {TABS.map((tab) => (
        <button
          key={tab.key}
          type="button"
          data-testid={`mobile-tab-${tab.key}`}
          data-tour={`mobile-tab-${tab.key}`}
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
