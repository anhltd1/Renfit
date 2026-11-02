import { useCallback, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../primitives/cn';
import { haptic } from '../primitives/haptics';
import { bookingStatusMeta, type BookingStatusKey } from './statusMeta';
import { useUndoableAction } from '../hooks/useUndoableAction';
import type { UseToastResult } from '../hooks/useToast';
import { updateBookingStatus } from '../../../lib/api/admin';

/**
 * BookingStatusActions (U22 Attendance, FR-1/FR-6).
 * The allowed next states for one booking, mirroring the backend transition
 * table in `booking_service.set_booking_status`:
 *
 *   pending                → Duyệt, Từ chối
 *   approved (not started) → Từ chối, Chờ duyệt
 *   approved (started)     → Đã tập, Vắng, Từ chối
 *   completed              → Vắng, Về Đã duyệt
 *   no_show                → Đã tập, Về Đã duyệt
 *   rejected               → Chờ duyệt, Duyệt
 *
 * The current status is never an action. Icons/colours come from the shared
 * `bookingStatusMeta`; the backend stays the authority (400s surface as
 * error toasts via `useBookingStatusChange`).
 */

// ── Pure helpers ────────────────────────────────────────────────────────────

const ICT_OFFSET_HOURS = 7;

/**
 * True when the slot's start (a wall-clock ISO string in Asia/Ho_Chi_Minh,
 * e.g. "2026-10-29T07:00", seconds/offset ignored) is ≤ `now`. Parsed by hand
 * as ICT (UTC+7, no DST) so the browser timezone never shifts it.
 * Unparseable input → false (attendance actions stay hidden).
 */
export function hasSessionStarted(time: string, now: Date = new Date()): boolean {
  const m = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/.exec(time.trim());
  if (!m) return false;
  const n = (i: number) => Number(m[i]);
  const startUtc = Date.UTC(n(1), n(2) - 1, n(3), n(4) - ICT_OFFSET_HOURS, n(5));
  return startUtc <= now.getTime();
}

export interface StatusAction {
  next: BookingStatusKey;
  label: string;
}

/** Allowed next states for `status` (unknown statuses → none). */
export function getStatusActions(status: string, started: boolean): StatusAction[] {
  switch (status) {
    case 'pending':
      return [
        { next: 'approved', label: 'Duyệt' },
        { next: 'rejected', label: 'Từ chối' },
      ];
    case 'approved':
      return started
        ? [
            { next: 'completed', label: 'Đã tập' },
            { next: 'no_show', label: 'Vắng' },
            { next: 'rejected', label: 'Từ chối' },
          ]
        : [
            { next: 'rejected', label: 'Từ chối' },
            { next: 'pending', label: 'Chờ duyệt' },
          ];
    case 'completed':
      return [
        { next: 'no_show', label: 'Vắng' },
        { next: 'approved', label: 'Về Đã duyệt' },
      ];
    case 'no_show':
      return [
        { next: 'completed', label: 'Đã tập' },
        { next: 'approved', label: 'Về Đã duyệt' },
      ];
    case 'rejected':
      return [
        { next: 'pending', label: 'Chờ duyệt' },
        { next: 'approved', label: 'Duyệt' },
      ];
    default:
      return [];
  }
}

// ── Component ───────────────────────────────────────────────────────────────

export interface BookingStatusActionsBooking {
  id: string;
  customer_id: string;
  time: string;
  status: BookingStatusKey;
}

export interface BookingStatusActionsProps {
  booking: BookingStatusActionsBooking;
  onChange: (next: BookingStatusKey, prev: BookingStatusKey) => Promise<void>;
  busy?: boolean;
  layout?: 'grid' | 'inline';
  size?: 'md' | 'lg';
  /** Injectable clock (tests). */
  now?: Date;
  className?: string;
}

const GRID_COLS: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
};

const ACTION_TONE: Record<BookingStatusKey, string> = {
  approved: 'border-primary-text/50 bg-[#0F6B3E]/15 hover:bg-[#0F6B3E]/30',
  pending: 'border-[#f59e0b]/50 bg-[#f59e0b]/10 hover:bg-[#f59e0b]/20',
  completed: 'border-white/25 bg-white/5 hover:bg-white/10',
  no_show: 'border-error-text/50 bg-[#f87171]/10 hover:bg-[#f87171]/20',
  rejected: 'border-dashed border-white/30 bg-transparent hover:bg-white/5',
};

export function BookingStatusActions({
  booking,
  onChange,
  busy = false,
  layout = 'grid',
  size = 'md',
  now,
  className,
}: BookingStatusActionsProps) {
  const [working, setWorking] = useState<BookingStatusKey | null>(null);
  const actions = getStatusActions(booking.status, hasSessionStarted(booking.time, now));
  if (actions.length === 0) return null;
  const disabled = busy || working !== null;

  const handle = async (next: BookingStatusKey) => {
    setWorking(next);
    try {
      await onChange(next, booking.status);
    } finally {
      setWorking(null);
    }
  };

  const lg = size === 'lg';
  return (
    <div
      data-testid="booking-status-actions"
      role="group"
      aria-label={`Đổi trạng thái lịch của ${booking.customer_id}`}
      className={cn(
        layout === 'grid' ? cn('grid gap-2', GRID_COLS[actions.length] ?? 'grid-cols-3') : 'flex flex-wrap gap-2',
        className,
      )}
    >
      {actions.map(({ next, label }) => {
        const meta = bookingStatusMeta[next];
        const Icon = working === next ? Loader2 : meta.Icon;
        return (
          <button
            key={next}
            type="button"
            data-testid={`status-action-${next}`}
            disabled={disabled}
            onClick={() => void handle(next)}
            aria-label={`${label}: ${booking.customer_id}`}
            className={cn(
              'tap-target rounded-xl border font-semibold leading-relaxed transition-colors active:scale-[0.97]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3DBE7A]',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              layout === 'grid'
                ? cn('flex flex-col items-center justify-center gap-1', lg ? 'py-4 px-3' : 'py-3 px-2')
                : cn('inline-flex items-center gap-1.5', lg ? 'px-4 py-2.5' : 'px-3 py-1.5'),
              lg ? 'text-base' : 'text-sm',
              meta.textClass,
              ACTION_TONE[next],
            )}
          >
            <Icon className={cn('shrink-0', lg ? 'w-5 h-5' : 'w-4 h-4', working === next && 'animate-spin')} aria-hidden="true" />
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ── Hook ────────────────────────────────────────────────────────────────────

function successText(next: BookingStatusKey, name: string): string {
  switch (next) {
    case 'rejected':
      return `Đã từ chối lịch của ${name}.`;
    case 'completed':
      return `Đã điểm danh ${name}: Đã tập.`;
    case 'no_show':
      return `Đã điểm danh ${name}: Vắng.`;
    case 'approved':
      return `Đã duyệt lịch của ${name}.`;
    case 'pending':
      return `Đã chuyển lịch của ${name} về Chờ duyệt.`;
  }
}

/** Status changes that get a 5 s "Hoàn tác" back to the previous status. */
const UNDOABLE: ReadonlySet<BookingStatusKey> = new Set(['rejected', 'completed', 'no_show']);

export interface UseBookingStatusChangeOptions {
  show: UseToastResult['show'];
  /** Reload the screen's data after a change or an undo. Errors are ignored. */
  refresh: () => unknown;
}

/**
 * Wraps `updateBookingStatus` in `useUndoableAction`. Returns `true` when the
 * change succeeded (callers usually close their dialog then). Backend 400
 * details (e.g. "Buổi tập chưa bắt đầu.") surface as the error toast text.
 */
export function useBookingStatusChange({ show, refresh }: UseBookingStatusChangeOptions): {
  change: (
    booking: { id: string; customer_id: string },
    next: BookingStatusKey,
    prev: BookingStatusKey,
  ) => Promise<boolean>;
  pending: boolean;
} {
  const { run, pending } = useUndoableAction(show);

  const change = useCallback(
    async (booking: { id: string; customer_id: string }, next: BookingStatusKey, prev: BookingStatusKey) => {
      const reload = () => {
        try {
          void Promise.resolve(refresh()).catch(() => {});
        } catch {
          /* ignore */
        }
      };
      haptic();
      const ok = await run({
        action: () => updateBookingStatus(booking.id, next),
        undo: UNDOABLE.has(next) && next !== prev
          ? async () => {
              await updateBookingStatus(booking.id, prev);
              reload();
            }
          : undefined,
        successText: successText(next, booking.customer_id),
        errorText: 'Cập nhật thất bại.',
      });
      if (ok) reload();
      return ok;
    },
    [run, refresh],
  );

  return { change, pending };
}
