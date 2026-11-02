import React from 'react';
import { CircleHelp } from 'lucide-react';
import { cn } from '../primitives/cn';
import { bookingStatusLabel, bookingStatusMeta, isBookingStatusKey } from './statusMeta';

/**
 * StatusBadge (U20 Ops Foundation, FR-6) — icon + label pill for a booking
 * status, styled from the shared `bookingStatusMeta`. Unknown statuses render
 * a neutral pill with the raw value instead of crashing.
 */
export interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
  className?: string;
}

const SIZE = {
  sm: { pill: 'px-2.5 py-0.5 text-xs gap-1', icon: 'w-3.5 h-3.5' },
  md: { pill: 'px-3 py-1 text-sm gap-1.5', icon: 'w-4 h-4' },
} as const;

export function StatusBadge({ status, size = 'sm', className }: StatusBadgeProps) {
  const meta = isBookingStatusKey(status) ? bookingStatusMeta[status] : null;
  const Icon = meta?.Icon ?? CircleHelp;
  const s = SIZE[size];
  return (
    <span
      data-testid={`status-badge-${status}`}
      className={cn(
        'inline-flex items-center rounded-full font-medium leading-relaxed whitespace-nowrap',
        s.pill,
        meta ? meta.pillClass : 'bg-white/5 text-white/60 border border-white/20',
        className,
      )}
    >
      <Icon className={cn('shrink-0', s.icon)} aria-hidden="true" />
      <span>{meta ? meta.label : bookingStatusLabel(status)}</span>
    </span>
  );
}
