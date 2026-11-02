import { cn } from '../primitives/cn';
import { CLIENT_FILTERS, CLIENT_FILTER_LABELS, type ClientFilter } from './clientFilters';

export interface ClientFilterChipsProps {
  value: ClientFilter;
  onChange: (next: ClientFilter) => void;
  className?: string;
}

/** Filter chips for the client list (U24, FR-10) — shared by desktop and mobile. */
export function ClientFilterChips({ value, onChange, className }: ClientFilterChipsProps) {
  return (
    <div role="group" aria-label="Lọc hội viên" className={cn('flex flex-wrap items-center gap-1.5', className)}>
      {CLIENT_FILTERS.map((key) => {
        const pressed = value === key;
        return (
          <button
            key={key}
            type="button"
            data-testid={`client-filter-${key}`}
            aria-pressed={pressed}
            onClick={() => onChange(key)}
            className={cn(
              'tap-target inline-flex items-center justify-center px-3 rounded-full border text-sm leading-relaxed transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3DBE7A]',
              pressed
                ? 'bg-[#0F6B3E]/25 border-primary-text/50 text-primary-text font-semibold'
                : 'border-white/15 text-white/70 hover:text-white hover:border-white/30',
            )}
          >
            {CLIENT_FILTER_LABELS[key]}
          </button>
        );
      })}
    </div>
  );
}
