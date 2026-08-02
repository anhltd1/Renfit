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
 */
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  /** Reduce default padding (e.g. for dense list items). */
  compact?: boolean;
}

export function Card({ hoverable = false, compact = false, className, children, onClick, onKeyDown, ...rest }: CardProps) {
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
        'rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl',
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
