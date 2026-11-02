/**
 * Client list filters + sort (U24, FR-10). Shared by the desktop sidebar and
 * the mobile list so both trees filter identically.
 *
 * Dates on `CustomerSummary` (`last_session`, `next_session`) are wall-clock
 * ISO strings in Asia/Ho_Chi_Minh ("YYYY-MM-DDTHH:00"); only the date part is
 * compared, as plain strings, so the browser timezone never shifts a result.
 */
import type { CustomerSummary } from '../../../lib/api/admin';

export type ClientFilter = 'active' | 'archived' | 'booked_this_week' | 'inactive_14d';

export const CLIENT_FILTERS: readonly ClientFilter[] = [
  'active',
  'archived',
  'booked_this_week',
  'inactive_14d',
];

export const DEFAULT_CLIENT_FILTER: ClientFilter = 'active';

export const CLIENT_FILTER_LABELS: Record<ClientFilter, string> = {
  active: 'Đang tập',
  archived: 'Đã nghỉ',
  booked_this_week: 'Có lịch tuần này',
  inactive_14d: 'Lâu chưa tập',
};

export const INACTIVE_DAYS = 14;

const ICT_OFFSET_MS = 7 * 60 * 60 * 1000;
const DAY_MS = 86_400_000;

/** Today's calendar date in ICT as "YYYY-MM-DD". */
export function ictDateString(now: Date = new Date()): string {
  return new Date(now.getTime() + ICT_OFFSET_MS).toISOString().slice(0, 10);
}

function addDays(iso: string, days: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d) + days * DAY_MS).toISOString().slice(0, 10);
}

/** Monday and Sunday ("YYYY-MM-DD") of the ICT week containing `now`. */
export function ictWeekRange(now: Date = new Date()): { start: string; end: string } {
  const today = ictDateString(now);
  const [y, m, d] = today.split('-').map(Number);
  const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay(); // 0 = Sunday
  const sinceMonday = (dow + 6) % 7;
  const start = addDays(today, -sinceMonday);
  return { start, end: addDays(start, 6) };
}

/** Archived only when the backend says `active === false` (missing = active). */
export const isActiveClient = (c: CustomerSummary): boolean => c.active !== false;

/** Booked this week: upcoming (or today's) session within the Mon–Sun ICT week. */
export function isBookedThisWeek(c: CustomerSummary, now: Date = new Date()): boolean {
  if (!isActiveClient(c)) return false;
  const { start, end } = ictWeekRange(now);
  const today = ictDateString(now);
  const next = c.next_session?.slice(0, 10);
  if (next && next >= start && next <= end) return true;
  // The backend files today's sessions under `last_session`.
  const last = c.last_session?.slice(0, 10);
  return !!last && last === today && last >= start && last <= end;
}

/** Active and no session in the last 14 days (or never). */
export function isInactive14d(c: CustomerSummary, now: Date = new Date()): boolean {
  if (!isActiveClient(c)) return false;
  const last = c.last_session?.slice(0, 10);
  if (!last) return true;
  return last < addDays(ictDateString(now), -INACTIVE_DAYS);
}

export function matchesClientFilter(
  c: CustomerSummary,
  filter: ClientFilter,
  now: Date = new Date(),
): boolean {
  switch (filter) {
    case 'active':
      return isActiveClient(c);
    case 'archived':
      return !isActiveClient(c);
    case 'booked_this_week':
      return isBookedThisWeek(c, now);
    case 'inactive_14d':
      return isInactive14d(c, now);
  }
}

export function filterClients(
  customers: CustomerSummary[],
  filter: ClientFilter,
  now: Date = new Date(),
): CustomerSummary[] {
  return customers.filter((c) => matchesClientFilter(c, filter, now));
}

// ── Sort (moved from desktop CustomerSidebar, behaviour unchanged) ──────────

export type SortMode = 'alpha' | 'lastSession' | 'nextSession';

export const SORT_OPTIONS: readonly { key: SortMode; label: string }[] = [
  { key: 'alpha', label: 'A–Z' },
  { key: 'lastSession', label: 'Gần nhất' },
  { key: 'nextSession', label: 'Sắp tới' },
];

/** Returns a new array: active members first, then the chosen sort within each group. */
export function sortClients(customers: CustomerSummary[], sort: SortMode): CustomerSummary[] {
  return [...customers].sort((a, b) => {
    const aActive = isActiveClient(a);
    const bActive = isActiveClient(b);
    if (aActive && !bActive) return -1;
    if (!aActive && bActive) return 1;
    if (sort === 'lastSession') {
      return (a.last_session ?? '').localeCompare(b.last_session ?? ''); // oldest first
    }
    if (sort === 'nextSession') {
      return (a.next_session ?? 'z').localeCompare(b.next_session ?? 'z'); // soonest first
    }
    return a.id.localeCompare(b.id);
  });
}
