/**
 * Banner shown on the PT login screens after a 401 redirected here with
 * `/admin?expired=1` (U25, FR-11). Hidden once the user starts typing.
 */
import { Clock } from 'lucide-react';

export const SESSION_EXPIRED_MESSAGE = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';

export function SessionExpiredNotice() {
  return (
    <div
      role="status"
      data-testid="admin-session-expired"
      className="flex items-start gap-2.5 text-sm leading-relaxed text-white/90 bg-amber-400/10 border border-amber-400/30 rounded-xl px-4 py-2.5 mb-4"
    >
      <Clock className="w-4 h-4 mt-1 shrink-0 text-amber-400" aria-hidden="true" />
      <span>{SESSION_EXPIRED_MESSAGE}</span>
    </div>
  );
}
