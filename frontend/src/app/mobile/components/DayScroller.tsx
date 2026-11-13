/**
 * Horizontal touch day-scroller (U4 Trainee Mobile, TS-3, BOOK-1).
 * Lets the trainee tap through the days already returned by
 * useBookingAvailability() without a separate stack screen.
 */
import { cn } from '../../shared/primitives/cn';
import type { DayAvailability } from '../../../lib/api/bookings';

const VIET_DAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

function fmtDayLabel(iso: string): string {
  const [, m, d] = iso.split('-');
  return `${d}/${m}`;
}

export interface DayScrollerProps {
  days: DayAvailability[];
  selected: string;
  onSelect: (date: string) => void;
}

export function DayScroller({ days, selected, onSelect }: DayScrollerProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 snap-x snap-mandatory">
      {days.map((day) => {
        const isSelected = day.date === selected;
        const dowIdx = new Date(day.date).getDay();
        return (
          <button
            key={day.date}
            type="button"
            data-testid={`day-scroller-${day.date}`}
            onClick={() => onSelect(day.date)}
            className={cn(
              'shrink-0 snap-start flex flex-col items-center justify-center rounded-control px-4 py-2 min-w-[60px] min-h-[52px] border transition-colors',
              isSelected
                ? 'bg-white text-[#0B0B0B] border-white'
                : 'bg-surface text-white/80 border-line',
            )}
          >
            <span className="text-xs font-medium">{VIET_DAYS[dowIdx]}</span>
            <span className="text-sm font-semibold mt-0.5 tabular-nums">{fmtDayLabel(day.date)}</span>
          </button>
        );
      })}
    </div>
  );
}
