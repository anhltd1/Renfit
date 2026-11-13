import React from 'react';
import { cn } from './cn';

/**
 * Card primitive — DESIGN.md v2 "Cards and panels".
 * Opaque `surface` panel, 1px `line` border, 14px radius, no shadow, no blur.
 * Interactive cards change background on hover — they never move or glow.
 *
 * When `onClick` is passed the card becomes keyboard-operable (role="button",
 * tabIndex 0, Enter/Space) without changing its DOM shape.
 *
 * `tier` is kept for API compatibility:
 * - `ambient` / `card`: the resting panel (`surface`).
 * - `elevated`: something that floats (sticky bars, popovers) — `overlay` + shadow.
 */
export type GlassTier = 'ambient' | 'card' | 'elevated';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  /** Reduce default padding (e.g. for dense list items). */
  compact?: boolean;
  /** Glass tier — controls backdrop blur and surface treatment. */
  tier?: GlassTier;
}

const TIER_CLASSES: Record<GlassTier, string> = {
  ambient: 'bg-surface border border-line',
  card: 'bg-surface border border-line',
  elevated: 'bg-overlay border border-line shadow-[0_16px_48px_rgba(0,0,0,0.5)]',
};

export function Card({ hoverable = false, compact = false, tier, className, children, onClick, onKeyDown, ...rest }: CardProps) {
  const interactive = !!onClick;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(e);
    if (!interactive) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      (onClick as React.MouseEventHandler<HTMLDivElement>)(e as unknown as React.MouseEvent<HTMLDivElement>);
    }
  };

  return (
    <div
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onClick={onClick}
      onKeyDown={interactive ? handleKeyDown : onKeyDown}
      className={cn(
        'rounded-panel',
        TIER_CLASSES[tier ?? 'card'],
        compact ? 'p-4' : 'p-5 sm:p-6',
        (hoverable || interactive) &&
          'transition-colors duration-[var(--motion-fast)] hover:bg-surface-2 cursor-pointer',
        interactive && 'active:bg-surface-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-text focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0B0B]',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
