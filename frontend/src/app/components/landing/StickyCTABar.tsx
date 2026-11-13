import { cn } from '../../shared/primitives/cn';
import { Link } from '../Link';
import { getAuthUser } from '../../../lib/auth';

interface StickyCTABarProps {
  /** Whether the hero section is still visible. Hides the bar when true. */
  heroVisible: boolean;
}

/**
 * Mobile-only sticky booking bar at the bottom of the viewport, shown once
 * the hero has scrolled away (< 640px). Opaque ground + 1px rule (DESIGN.md v2).
 */
export function StickyCTABar({ heroVisible }: StickyCTABarProps) {
  const user = getAuthUser();

  if (heroVisible) return null;

  return (
    <div
      className={cn('fixed bottom-0 left-0 right-0 z-40 sm:hidden bg-[#0B0B0B] border-t border-line px-4 py-3 animate-slide-up')}
      style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))' }}
    >
      <Link
        to={user ? '/dashboard' : '/signup'}
        className="flex w-full min-h-[44px] items-center justify-center rounded-full bg-primary hover:bg-primary-hover text-white font-semibold transition-colors active:scale-[0.97]"
      >
        {user ? 'Trang của tôi' : 'Đặt lịch tập'}
      </Link>
    </div>
  );
}
