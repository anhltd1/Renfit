import { cn } from '../primitives/cn';

/**
 * CapacityMarks — the Renfit signature element (DESIGN.md v2 "capacity_marks").
 *
 * Every hour at Renfit has 4 places. This draws a slot's places as marks:
 * filled emerald = taken, outlined = free, the viewer's own place in the
 * lighter green. The marks are decorative (`aria-hidden`); the text label
 * (or the caller's own accessible name) carries the meaning, so colour is
 * never the only signal.
 */
export const PLACES_PER_SLOT = 4;

export interface CapacityMarksProps {
  /** Places taken in the slot (pending, approved, completed and no_show all hold a place). */
  taken: number;
  /** Total places — 4 at Renfit. */
  capacity?: number;
  /** Whether one of the taken places is the viewer's own booking. */
  mine?: boolean;
  /** `dots` for calendars and timelines, `bars` for dense rows. */
  variant?: 'dots' | 'bars';
  /** Render the "2/4" / "Hết chỗ" text after the marks. */
  showLabel?: boolean;
  /** Label style: compact "2/4" or the member-facing "Còn 2 chỗ". */
  labelStyle?: 'fraction' | 'remaining';
  className?: string;
}

export function capacityLabel(taken: number, capacity = PLACES_PER_SLOT, style: 'fraction' | 'remaining' = 'fraction'): string {
  const t = Math.max(0, Math.min(taken, capacity));
  if (style === 'fraction') return `${t}/${capacity}`;
  const free = capacity - t;
  return free === 0 ? 'Hết chỗ' : `Còn ${free} chỗ`;
}

export function CapacityMarks({
  taken,
  capacity = PLACES_PER_SLOT,
  mine = false,
  variant = 'dots',
  showLabel = false,
  labelStyle = 'fraction',
  className,
}: CapacityMarksProps) {
  const t = Math.max(0, Math.min(taken, capacity));
  const full = t >= capacity;
  const mark = variant === 'dots' ? 'w-1.5 h-1.5 rounded-full' : 'w-[3px] h-3 rounded-[1px]';

  return (
    <span
      data-testid="capacity-marks"
      data-taken={t}
      className={cn('inline-flex items-center gap-1.5', className)}
    >
      <span className="inline-flex items-center gap-0.5" aria-hidden="true">
        {Array.from({ length: capacity }, (_, i) => {
          const isTaken = i < t;
          // The viewer's own place is drawn last among the taken ones.
          const isMine = mine && isTaken && i === t - 1;
          return (
            <span
              key={i}
              className={cn(
                mark,
                isMine
                  ? 'bg-primary-text'
                  : isTaken
                    ? 'bg-primary'
                    : 'border border-white/25 bg-transparent',
              )}
            />
          );
        })}
      </span>
      {showLabel && (
        <span className={cn('text-xs tabular-nums leading-none', full ? 'text-white/64' : 'text-white/80')}>
          {capacityLabel(t, capacity, labelStyle)}
        </span>
      )}
    </span>
  );
}
