import { CalendarCheck, CheckCheck, Clock, UserX, X, type LucideIcon } from 'lucide-react';

/**
 * Booking status visual language (U20 Ops Foundation, FR-6).
 * Single source of truth for DESIGN.md `booking_status`: every status is
 * colour + icon + label, never colour alone. Finished/removed states
 * (`completed`, `rejected`) recede; attention states (`pending`, `no_show`)
 * stand out. Don't redefine status colours/labels per component.
 *
 * DESIGN.md v2: pills are a pale tint of the status hue with text in that hue
 * (never a saturated fill with white text). Contrast on #0B0B0B: amber #fbbf24
 * ≈ 11:1, #3DBE7A 8.29:1, #f87171 7.12:1, white/64 ≈ 7.8:1.
 */
export type BookingStatusKey = 'pending' | 'approved' | 'rejected' | 'completed' | 'no_show';

export interface BookingStatusMeta {
  label: string;
  Icon: LucideIcon;
  /** Full pill styling: background tint + text colour + border (style included). */
  pillClass: string;
  /** Text/icon colour only — for inline status text or calendar pills with their own layout. */
  textClass: string;
  borderStyle: 'solid' | 'dashed';
  /** Visually quieter (finished or removed). */
  recede: boolean;
  /** Label rendered with line-through (rejected). */
  strike: boolean;
}

export const bookingStatusMeta: Record<BookingStatusKey, BookingStatusMeta> = {
  pending: {
    label: 'Chờ duyệt',
    Icon: Clock,
    pillClass: 'bg-[#fbbf24]/12 text-warning-text border border-solid border-[#fbbf24]/30',
    textClass: 'text-warning-text',
    borderStyle: 'solid',
    recede: false,
    strike: false,
  },
  approved: {
    label: 'Đã duyệt',
    Icon: CalendarCheck,
    pillClass: 'bg-primary-tint text-primary-text border border-solid border-primary-text/35',
    textClass: 'text-primary-text',
    borderStyle: 'solid',
    recede: false,
    strike: false,
  },
  completed: {
    label: 'Đã tập',
    Icon: CheckCheck,
    pillClass: 'bg-surface-2 text-white/64 border border-solid border-line',
    textClass: 'text-white/64',
    borderStyle: 'solid',
    recede: true,
    strike: false,
  },
  no_show: {
    label: 'Vắng',
    Icon: UserX,
    pillClass: 'bg-[#f87171]/12 text-error-text border border-solid border-error-text/35',
    textClass: 'text-error-text',
    borderStyle: 'solid',
    recede: false,
    strike: false,
  },
  rejected: {
    label: 'Từ chối',
    Icon: X,
    pillClass: 'bg-transparent text-white/64 border border-dashed border-white/25 line-through',
    textClass: 'text-white/64',
    borderStyle: 'dashed',
    recede: true,
    strike: true,
  },
};

export function isBookingStatusKey(s: string): s is BookingStatusKey {
  return Object.prototype.hasOwnProperty.call(bookingStatusMeta, s);
}

/** Vietnamese label for a status; unknown statuses fall back to the raw string. */
export function bookingStatusLabel(s: string): string {
  return isBookingStatusKey(s) ? bookingStatusMeta[s].label : s;
}

const VN_WEEKDAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'] as const;

/**
 * "T7 31/10 07:00" from an ISO-like local datetime ("2026-10-31T07:00",
 * seconds/offset ignored). Parsed by hand so the wall-clock time is never
 * shifted by the browser timezone. Anything unparseable is returned as-is.
 */
export function formatBookingTime(time: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/.exec(time.trim());
  if (!m) return time.trim();
  const [, y, mo, d, hh, mm] = m;
  const weekday = VN_WEEKDAYS[new Date(Number(y), Number(mo) - 1, Number(d)).getDay()];
  return `${weekday} ${d}/${mo} ${hh}:${mm}`;
}

/**
 * Accessible name for a booking (screen readers get the status in the name,
 * not in a `title` tooltip). `customer_id` should be the display name when the
 * caller has resolved it — it is used verbatim.
 * → "Nguyễn Văn A · T7 31/10 07:00 · Đã duyệt"
 */
export function bookingAccessibleName(b: { customer_id: string; time?: string; status: string }): string {
  const parts = [b.customer_id];
  if (b.time && b.time.trim()) parts.push(formatBookingTime(b.time));
  parts.push(bookingStatusLabel(b.status));
  return parts.join(' · ');
}
