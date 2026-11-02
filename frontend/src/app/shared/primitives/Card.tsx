import React from 'react';
import { cn } from './cn';

/**
 * Card primitive (U1 Foundation, EN-2).
 * DESIGN.md glassmorphism: transparent surface + backdrop-blur, subtle border,
 * 1.5rem radius, generous padding. Never a solid background.
 *
 * U8 Accessibility: when `onClick` is passed, the card is repurposed as an
 * interactive element (used this way for the mobile Overview/Profile-tab
 * shortcut cards) — automatically gets `role="button"`, `tabIndex={0}`, and
 * Enter/Space activation so it's keyboard operable, matching a native
 * `<button>`'s semantics without changing its visual/DOM shape.
 *
 * Glass_Tier system (landing page redesign):
 * - `ambient`: no blur, faint gradient — background fill only.
 * - `card` (default when tier is passed): 12px blur, inner highlight.
 * - `elevated`: 20px blur, inner highlight — nav bar, sticky bar, modals.
 * When `tier` is omitted the card renders with the legacy default (bg-white/5
 * backdrop-blur-xl) for backwards compatibility with existing call sites.
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
  ambient:
    'bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/10',
  card:
    'bg-gradient-to-b from-white/[0.07] to-white/[0.02] backdrop-blur-[12px] border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]',
  elevated:
    'bg-gradient-to-b from-white/[0.07] to-white/[0.02] backdrop-blur-[20px] border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]',
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
        'rounded-3xl',
        // Glass tier system: explicit tier overrides the legacy default
        tier ? TIER_CLASSES[tier] : 'border border-white/10 bg-white/5 backdrop-blur-xl',
        compact ? 'p-4' : 'p-8',
        hoverable &&
          'transition-all duration-300 hover:border-[#0F6B3E]/50 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(15,107,62,0.3)]',
        interactive && 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F6B3E] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0B0B]',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
