import { CapacityMarks, PLACES_PER_SLOT } from './CapacityMarks';
import { cn } from '../primitives/cn';

/**
 * DayTimeline — the trainer's day at a glance (DESIGN.md v2, Operations
 * surfaces "Layout around time"). One row per opening hour (08:00–20:00):
 * the hour, its capacity marks, and who is in it. The current hour carries a
 * green edge; past hours recede.
 */
export interface TimelineSession {
  time: string; // ISO-like local "YYYY-MM-DDTHH:MM"
  customer_id: string;
  status: string;
}

export const OPEN_HOURS = Array.from({ length: 13 }, (_, i) => 8 + i); // 08..20

/** Sessions that hold a place (everything except a rejected request). */
export function holdsPlace(status: string): boolean {
  return status !== 'rejected';
}

export function groupByHour(sessions: TimelineSession[]): Map<number, TimelineSession[]> {
  const map = new Map<number, TimelineSession[]>();
  for (const s of sessions) {
    if (!holdsPlace(s.status)) continue;
    const h = Number(s.time.slice(11, 13));
    if (Number.isNaN(h)) continue;
    map.set(h, [...(map.get(h) ?? []), s]);
  }
  return map;
}

export interface DayTimelineProps {
  sessions: TimelineSession[];
  /** Current hour at the gym; omit for a day that isn't today. */
  nowHour?: number;
  capacity?: number;
  onOpenMember?: (customerId: string) => void;
  className?: string;
}

export function DayTimeline({ sessions, nowHour, capacity = PLACES_PER_SLOT, onOpenMember, className }: DayTimelineProps) {
  const byHour = groupByHour(sessions);
  return (
    <ol className={cn('divide-y divide-line', className)} data-testid="day-timeline">
      {OPEN_HOURS.map((h) => {
        const people = byHour.get(h) ?? [];
        const isNow = nowHour === h;
        const past = nowHour !== undefined && h < nowHour;
        return (
          <li
            key={h}
            aria-current={isNow ? 'time' : undefined}
            className={cn(
              'relative flex items-center gap-3 pl-3 pr-2 min-h-10 py-1.5',
              isNow && 'bg-white/[0.03]',
            )}
          >
            {isNow && <span aria-hidden="true" className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary-text" />}
            <span className={cn('w-11 shrink-0 text-sm tabular-nums font-medium', past ? 'text-white/40' : 'text-white')}>
              {String(h).padStart(2, '0')}:00
            </span>
            <CapacityMarks taken={people.length} capacity={capacity} variant="bars" className={cn('shrink-0', past && 'opacity-50')} />
            <span className={cn('w-7 shrink-0 text-xs tabular-nums', people.length === 0 ? 'text-white/40' : 'text-white/64')}>
              {people.length}/{capacity}
            </span>
            <span className="min-w-0 flex-1 flex flex-wrap gap-x-2 gap-y-0.5 text-sm">
              {people.length === 0 ? (
                <span className="text-white/40">—</span>
              ) : (
                people.map((p, i) =>
                  onOpenMember ? (
                    <button
                      key={`${p.customer_id}-${i}`}
                      type="button"
                      onClick={() => onOpenMember(p.customer_id)}
                      className={cn(
                        'truncate max-w-[12rem] rounded-chip hover:underline underline-offset-2',
                        past ? 'text-white/64' : 'text-white/90',
                        p.status === 'pending' && 'text-warning-text',
                      )}
                    >
                      {p.customer_id}
                    </button>
                  ) : (
                    <span key={`${p.customer_id}-${i}`} className={cn('truncate max-w-[12rem]', past ? 'text-white/64' : 'text-white/90')}>
                      {p.customer_id}
                    </span>
                  ),
                )
              )}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
