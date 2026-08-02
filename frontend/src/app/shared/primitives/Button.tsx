import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from './cn';

/**
 * Button primitive (U1 Foundation, EN-2).
 * DESIGN.md: pill shape, emerald primary, hover scale 1.05 + green glow,
 * visible green focus ring, 300ms transitions.
 */
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

const VARIANT: Record<ButtonVariant, string> = {
  primary:
    'bg-[#0F6B3E] text-white hover:bg-[#0F6B3E]/90 hover:scale-105 hover:shadow-[0_0_30px_rgba(15,107,62,0.5)]',
  secondary:
    'bg-white/10 text-white border border-white/20 hover:bg-white/20 hover:scale-105',
  ghost: 'bg-transparent text-white/70 hover:text-white hover:bg-white/5',
  danger: 'bg-red-500 text-white hover:bg-red-400 hover:scale-105',
};

const SIZE: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-3.5 text-base',
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
        'inline-flex items-center justify-center gap-2 rounded-full font-semibold',
        'transition-all duration-300 ease-out',
        'outline-none focus-visible:ring-2 focus-visible:ring-[#0F6B3E] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0B0B]',
        'disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none',
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
