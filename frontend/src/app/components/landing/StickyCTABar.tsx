import { Button } from '../../shared/primitives/Button';
import { cn } from '../../shared/primitives/cn';
import { Link } from '../Link';
import { getAuthUser } from '../../../lib/auth';

interface StickyCTABarProps {
  /** Whether the hero section is still visible. Hides the bar when true. */
  heroVisible: boolean;
}

/**
 * Mobile-only sticky conversion bar at the bottom of the viewport.
 * Appears after the hero leaves the viewport on screens < 640px.
 * Uses the `elevated` Glass_Tier for maximum depth.
 */
export function StickyCTABar({ heroVisible }: StickyCTABarProps) {
  const user = getAuthUser();

  // Hidden on desktop (sm+) or when hero is visible
  if (heroVisible) return null;

  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 z-40 sm:hidden',
        'bg-gradient-to-b from-white/[0.07] to-white/[0.02] backdrop-blur-[20px]',
        'border-t border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]',
        'px-4 py-3 animate-slide-up',
      )}
      style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))' }}
    >
      <Link to={user ? '/dashboard' : '/login'} className="block">
        <Button variant="primary" size="md" className="w-full min-h-[44px] leading-relaxed">
          {user ? 'Vào trang chủ' : 'Đặt Lịch Ngay'}
        </Button>
      </Link>
    </div>
  );
}
