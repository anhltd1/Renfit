/**
 * todayModel — pure helpers for the "Hôm nay" hub (U23).
 * Session wall-clock times ("YYYY-MM-DDTHH:mm") are ICT (UTC+7), matching
 * `hasSessionStarted` in BookingStatusActions.
 */
import type { PendingBooking, TodaySession } from '../../../lib/api/admin';
import { hasSessionStarted } from './BookingStatusActions';

const ICT_OFFSET_MS = 7 * 3_600_000;
const SESSION_MS = 60 * 60_000;
const VIET_DAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

/** Epoch ms of an ICT wall-clock ISO string; NaN when unparseable. */
export function ictEpoch(time: string): number {
  const m = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/.exec(time.trim());
  if (!m) return NaN;
  return Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]) - ICT_OFFSET_MS;
}

function ictDate(now: Date, addDays = 0): string {
  return new Date(now.getTime() + ICT_OFFSET_MS + addDays * 86_400_000).toISOString().slice(0, 10);
}

export function pickCurrentAndNext(
  sessions: TodaySession[],
  now: Date = new Date(),
): { current?: TodaySession; next?: TodaySession } {
  const sorted = sessions
    .filter((s) => s.status !== 'rejected')
    .slice()
    .sort((a, b) => a.time.localeCompare(b.time));
  const t = now.getTime();
  let current: TodaySession | undefined;
  let next: TodaySession | undefined;
  for (const s of sorted) {
    if (hasSessionStarted(s.time, now)) {
      if (ictEpoch(s.time) + SESSION_MS > t) current = s; // latest started one still running
    } else if (!next) {
      next = s;
    }
  }
  return { current, next };
}

export interface PendingDayGroup {
  date: string;
  label: string;
  items: PendingBooking[];
}

export function dayLabel(date: string, now: Date = new Date()): string {
  if (date === ictDate(now)) return 'Hôm nay';
  if (date === ictDate(now, 1)) return 'Ngày mai';
  const [y, m, d] = date.split('-').map(Number);
  const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return `${VIET_DAYS[dow]} ${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}`;
}

export function groupPendingByDay(pending: PendingBooking[], now: Date = new Date()): PendingDayGroup[] {
  const map = new Map<string, PendingBooking[]>();
  for (const p of pending) {
    const date = p.time.slice(0, 10);
    const list = map.get(date);
    if (list) list.push(p);
    else map.set(date, [p]);
  }
  return Array.from(map.keys())
    .sort()
    .map((date) => ({
      date,
      label: dayLabel(date, now),
      items: map.get(date)!.slice().sort((a, b) => a.time.localeCompare(b.time)),
    }));
}

function dur(min: number): string {
  if (min < 60) return `${min} phút`;
  const h = Math.floor(min / 60);
  const r = min % 60;
  return r ? `${h} giờ ${r} phút` : `${h} giờ`;
}

export function countdownLabel(time: string, now: Date = new Date()): string {
  const start = ictEpoch(time);
  if (Number.isNaN(start)) return '';
  const toStart = Math.ceil((start - now.getTime()) / 60_000);
  if (toStart > 0) return `Bắt đầu sau ${dur(toStart)}`;
  const left = Math.ceil((start + SESSION_MS - now.getTime()) / 60_000);
  if (left > 0) return `Đang tập · còn ${dur(left)}`;
  return 'Đã kết thúc';
}
