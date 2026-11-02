/**
 * Horizontal day scroller for the mobile Lịch đặt agenda (U24, FR-5).
 * Shows every calendar day of the booking window; Sundays render as "Nghỉ"
 * and are not selectable; today is labelled "Hôm nay".
 */
import { useEffect, useRef } from 'react';
import { cn } from '../../shared/primitives/cn';

export interface ScrollerDay {
  date: string; // YYYY-MM-DD
  sunday: boolean;
}

const VIET_DAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

/** Weekday index (0 = Sunday) of a YYYY-MM-DD date, timezone-independent. */
export function weekdayOf(iso: string): number {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

export function fmtDayMonth(iso: string): string {
  const [, m, d] = iso.split('-');
  return `${d}/${m}`;
}

export function shortWeekday(iso: string): string {
  return VIET_DAYS[weekdayOf(iso)];
}

/**
 * Every date from the first to the last working day (inclusive), with
 * Sundays flagged. The backend only returns working days.
 */
export function buildScrollerDays(workingDates: string[]): ScrollerDay[] {
  if (workingDates.length === 0) return [];
  const sorted = [...workingDates].sort();
  const out: ScrollerDay[] = [];
  const [y, m, d] = sorted[0].split('-').map(Number);
  let t = Date.UTC(y, m - 1, d);
  const last = sorted[sorted.length - 1];
  for (let i = 0; i < 62; i++) {
    const iso = new Date(t).toISOString().slice(0, 10);
    out.push({ date: iso, sunday: weekdayOf(iso) === 0 });
    if (iso >= last) break;
    t += 86_400_000;
  }
  return out;
}

export interface AdminDayScrollerProps {
  days: ScrollerDay[];
  selected: string;
  today: string;
  onSelect: (date: string) => void;
}

export function AdminDayScroller({ days, selected, today, onSelect }: AdminDayScrollerProps) {
  const selectedRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const el = selectedRef.current;
    if (el && typeof el.scrollIntoView === 'function') {
      el.scrollIntoView({ block: 'nearest', inline: 'center' });
    }
  }, [selected]);

  return (
    <div
      role="group"
      aria-label="Chọn ngày"
      data-testid="admin-day-scroller"
      className="flex gap-2 overflow-x-auto overscroll-x-contain px-4 py-2 [scrollbar-width:none]"
    >
      {days.map(({ date, sunday }) => {
        const isSelected = date === selected;
        const isToday = date === today;
        return (
          <button
            key={date}
            ref={isSelected ? selectedRef : undefined}
            type="button"
            data-testid={`admin-day-${date}`}
            disabled={sunday}
            aria-pressed={isSelected}
            aria-current={isToday ? 'date' : undefined}
            aria-label={`${shortWeekday(date)} ${fmtDayMonth(date)}${isToday ? ', hôm nay' : ''}${sunday ? ', nghỉ' : ''}`}
            onClick={() => onSelect(date)}
            className={cn(
              'shrink-0 min-w-14 min-h-14 px-2 py-1.5 rounded-2xl border flex flex-col items-center justify-center leading-tight tabular-nums transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3DBE7A]',
              sunday
                ? 'border-white/10 text-white/40 cursor-not-allowed'
                : isSelected
                  ? 'bg-[#0F6B3E] border-[#0F6B3E] text-white'
                  : isToday
                    ? 'border-primary-text/50 text-primary-text'
                    : 'border-white/10 text-white/80',
            )}
            style={
              sunday
                ? { background: 'repeating-linear-gradient(-45deg, transparent 0 6px, rgba(255,255,255,0.04) 6px 7px)' }
                : undefined
            }
          >
            <span className="text-xs font-semibold">{shortWeekday(date)}</span>
            <span className="text-sm font-bold">{fmtDayMonth(date)}</span>
            <span className={cn('text-xs', isSelected ? 'text-white' : sunday ? 'text-white/40' : 'text-white/60')}>
              {sunday ? 'Nghỉ' : isToday ? 'Hôm nay' : '\u00a0'}
            </span>
          </button>
        );
      })}
    </div>
  );
}
