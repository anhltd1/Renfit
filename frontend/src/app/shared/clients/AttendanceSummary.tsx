import { CheckCheck, UserX } from 'lucide-react';
import { useAttendance } from '../hooks/useAttendance';
import { cn } from '../primitives/cn';

/**
 * "Đã tập N · Vắng M" for one member (U24, FR-1 member-detail summary).
 * Shared by desktop CustomerDetail and mobile CustomerDetailScreen. Hidden
 * on error (the rest of the detail stays usable); "—" while loading.
 */
export function AttendanceSummary({ customerId, className }: { customerId: string; className?: string }) {
  const { data, loading, error } = useAttendance(customerId);
  if (error) return null;
  const done = data?.completed;
  const missed = data?.no_show;
  const fmt = (n: number | undefined) => (loading && n == null ? '—' : String(n ?? 0));
  return (
    <p
      data-testid="attendance-summary"
      aria-label={loading && !data ? 'Đang tải điểm danh' : `Đã tập ${done ?? 0} buổi, vắng ${missed ?? 0} buổi`}
      className={cn('inline-flex items-center gap-2 text-sm text-white/70 leading-relaxed tabular-nums', className)}
    >
      <span className="inline-flex items-center gap-1">
        <CheckCheck className="w-4 h-4 text-white/64" aria-hidden="true" />
        Đã tập {fmt(done)}
      </span>
      <span className="text-white/40" aria-hidden="true">·</span>
      <span className="inline-flex items-center gap-1">
        <UserX className="w-4 h-4 text-error-text" aria-hidden="true" />
        Vắng {fmt(missed)}
      </span>
    </p>
  );
}
