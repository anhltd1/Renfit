import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from './cn';

/**
 * Button primitive — DESIGN.md v2 "Buttons".
 * primary: emerald fill, pill — the ONE action a screen exists for.
 * secondary / ghost / danger: 10px radius, neutral surfaces.
 * Hover changes colour only (no scale, no glow); press dips to 0.97.
 */
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

const VARIANT: Record<ButtonVariant, string> = {
  primary: 'rounded-full bg-primary text-white hover:bg-primary-hover',
  secondary: 'rounded-control bg-surface-2 text-white border border-line-strong hover:bg-surface-3',
  ghost: 'rounded-control bg-transparent text-white/70 hover:text-white hover:bg-surface-2',
  danger: 'rounded-control bg-transparent text-error-text border border-error-text/35 hover:bg-error-text/10',
};

const SIZE: Record<ButtonSize, string> = {
  sm: 'px-3.5 py-2 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3.5 text-base',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type="button"
      data-testid={`button-${variant}`}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-semibold',
        'transition-colors duration-[var(--motion-fast)] ease-out',
        // Press feedback: a 3% dip reads as "registered" on touch, where there
        // is no hover state to confirm the tap.
        'active:scale-[0.97] active:duration-[var(--motion-fast)] disabled:active:scale-100',
        'outline-none focus-visible:ring-2 focus-visible:ring-primary-text focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0B0B]',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        VARIANT[variant],
        SIZE[size],
        className,
      )}
      {...rest}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
}
