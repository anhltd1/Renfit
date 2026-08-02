import React, { useId } from 'react';
import { cn } from './cn';

/**
 * Input primitive (U1 Foundation, EN-2).
 * Dark-theme field, green focus border, optional leading icon + label + error.
 * Vietnamese-safe: relaxed line-height, no text-transform.
 */
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  /** Stable test id suffix; defaults to name. */
  testId?: string;
}

export function Input({
  label,
  error,
  icon,
  testId,
  id,
  name,
  className,
  ...rest
}: InputProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const tid = testId ?? name ?? 'field';

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-white/70 text-sm mb-2 leading-relaxed">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">{icon}</span>
        )}
        <input
          id={inputId}
          name={name}
          data-testid={`input-${tid}`}
          aria-invalid={!!error}
          className={cn(
            'w-full rounded-2xl bg-white/5 border text-white placeholder:text-white/30',
            'py-3.5 px-4 leading-relaxed outline-none transition-colors duration-300',
            'focus:border-[#0F6B3E] focus-visible:ring-2 focus-visible:ring-[#0F6B3E]/40',
            icon && 'pl-11',
            error ? 'border-red-400/60' : 'border-white/10',
            className,
          )}
          {...rest}
        />
      </div>
      {error && <p className="text-red-400 text-sm mt-1.5 leading-relaxed">{error}</p>}
    </div>
  );
}
