/**
 * Member home model — pure functions shared by the desktop and mobile member
 * home screens (DESIGN.md v2). The screen's one question is
 * "Khi nào tôi tập buổi tới?"; these turn the availability + InBody payloads
 * into the figures that answer it, with Vietnamese number formatting and
 * deltas that always name their baseline.
 */
import type { Availability, BookingStatus } from '../../../lib/api/bookings';
import type { InbodyRecordOut } from '../../../lib/api/profile';

const VN_WEEKDAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'] as const;
const pad = (n: number) => String(n).padStart(2, '0');

/** Wall-clock "now" at the gym (Asia/Ho_Chi_Minh), as a local Date. */
export function gymNow(): Date {
  return new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
}

function parseDay(date: string): Date {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** "T3 10/11" for "2026-11-10". */
export function dayLabel(date: string): string {
  const d = parseDay(date);
  return `${VN_WEEKDAYS[d.getDay()]} ${pad(d.getDate())}/${pad(d.getMonth() + 1)}`;
}

/** Vietnamese decimal: 72.4 → "72,4". */
export function formatVi(n: number, digits = 1): string {
  return n.toLocaleString('vi-VN', { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

/** Signed change with a true minus sign: −2,4 / +0,6 / 0,0. */
export function formatSigned(n: number, digits = 1): string {
  const r = Number(n.toFixed(digits));
  if (r === 0) return formatVi(0, digits);
  return `${r > 0 ? '+' : '−'}${formatVi(Math.abs(r), digits)}`;
}

export interface NextSession {
  date: string;
  hour: number;
  day: string;          // "T3 10/11"
  time: string;         // "18:00"
  status: Extract<BookingStatus, 'pending' | 'approved'>;
  taken: number;        // places held in that slot, including mine
  capacity: number;
  startsAt: Date;
}

export function getNextSession(av: Availability | null, now: Date): NextSession | null {
  if (!av) return null;
  for (const day of av.days) {
    for (const slot of day.slots) {
      if (slot.my_status !== 'approved' && slot.my_status !== 'pending') continue;
      const startsAt = parseDay(day.date);
      startsAt.setHours(slot.hour, 0, 0, 0);
      if (startsAt.getTime() + 60 * 60 * 1000 <= now.getTime()) continue; // already over
      return {
        date: day.date,
        hour: slot.hour,
        day: dayLabel(day.date),
        time: `${pad(slot.hour)}:00`,
        status: slot.my_status,
        taken: slot.count,
        capacity: av.capacity,
        startsAt,
      };
    }
  }
  return null;
}

/** "Đang diễn ra" · "Còn 45 phút" · "Còn 3 giờ 20 phút" · "Ngày mai" · "Còn 3 ngày". */
export function countdownLabel(startsAt: Date, now: Date): string {
  const mins = Math.round((startsAt.getTime() - now.getTime()) / 60000);
  if (mins <= 0) return 'Đang diễn ra';
  const startDay = new Date(startsAt.getFullYear(), startsAt.getMonth(), startsAt.getDate()).getTime();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const days = Math.round((startDay - today) / 86_400_000);
  if (days === 0) {
    if (mins < 60) return `Còn ${mins} phút`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m === 0 ? `Còn ${h} giờ` : `Còn ${h} giờ ${m} phút`;
  }
  if (days === 1) return 'Ngày mai';
  return `Còn ${days} ngày`;
}

export interface OpenSlot {
  date: string;
  hour: number;
  day: string;
  time: string;
  taken: number;
  capacity: number;
  isToday: boolean;
}

/**
 * The next bookable slots from now: today's remaining hours, then tomorrow's,
 * skipping past, full, unavailable and already-mine slots.
 */
export function getOpenSlots(av: Availability | null, now: Date, limit = 5): OpenSlot[] {
  if (!av) return [];
  const todayKey = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const out: OpenSlot[] = [];
  for (const day of av.days) {
    if (day.date < todayKey) continue;
    for (const slot of day.slots) {
      if (slot.past || slot.full || !slot.available || slot.my_status) continue;
      if (day.date === todayKey && slot.hour <= now.getHours()) continue;
      out.push({
        date: day.date,
        hour: slot.hour,
        day: dayLabel(day.date),
        time: `${pad(slot.hour)}:00`,
        taken: slot.count,
        capacity: av.capacity,
        isToday: day.date === todayKey,
      });
      if (out.length >= limit) return out;
    }
  }
  return out;
}

export type Polarity = 'good' | 'bad' | 'neutral';

export interface InbodyMetric {
  key: 'weight' | 'bfm' | 'smm';
  label: string;
  value: number;
  /** Latest minus first measurement; null when there is only one record. */
  delta: number | null;
  polarity: Polarity;
}

export interface InbodySummary {
  metrics: InbodyMetric[];
  /** "12/08" — the first measurement, the baseline every delta names. */
  baseline: string | null;
  /** "09/11/2026" — latest measurement. */
  latestDate: string;
  count: number;
  weights: { date: string; value: number }[];
}

function shortDate(iso: string) {
  const [y, m, d] = iso.slice(0, 10).split('-');
  return { dm: `${d}/${m}`, dmy: `${d}/${m}/${y}` };
}

function polarityOf(key: InbodyMetric['key'], delta: number | null): Polarity {
  if (delta === null || Number(delta.toFixed(1)) === 0) return 'neutral';
  if (key === 'bfm') return delta < 0 ? 'good' : 'bad';
  if (key === 'smm') return delta > 0 ? 'good' : 'bad';
  return 'neutral'; // weight alone isn't good or bad — it depends on the goal
}

export function summarizeInbody(records: InbodyRecordOut[] | null | undefined): InbodySummary | null {
  if (!records || records.length === 0) return null;
  const sorted = [...records].sort((a, b) => a.date_recorded.localeCompare(b.date_recorded));
  const first = sorted[0];
  const latest = sorted[sorted.length - 1];
  const multi = sorted.length > 1;
  const metric = (key: InbodyMetric['key'], label: string, pick: (r: InbodyRecordOut) => number): InbodyMetric => {
    const delta = multi ? pick(latest) - pick(first) : null;
    return { key, label, value: pick(latest), delta, polarity: polarityOf(key, delta) };
  };
  return {
    metrics: [
      metric('weight', 'Cân nặng', (r) => r.weight),
      metric('bfm', 'Mỡ cơ thể', (r) => r.BFM),
      metric('smm', 'Cơ xương', (r) => r.SMM),
    ],
    baseline: multi ? shortDate(first.date_recorded).dm : null,
    latestDate: shortDate(latest.date_recorded).dmy,
    count: sorted.length,
    weights: sorted.map((r) => ({ date: shortDate(r.date_recorded).dm, value: r.weight })),
  };
}
