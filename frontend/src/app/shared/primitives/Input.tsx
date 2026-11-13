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
        <label htmlFor={inputId} className="block text-white/64 text-[13px] font-medium mb-1.5 leading-relaxed">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">{icon}</span>
        )}
        <input
          id={inputId}
          name={name}
          data-testid={`input-${tid}`}
          aria-invalid={!!error}
          className={cn(
            'w-full rounded-control bg-surface-2 border text-white placeholder:text-white/40',
            'py-3 px-4 leading-relaxed outline-none transition-colors duration-[var(--motion-fast)]',
            'focus:border-primary-text focus:ring-2 focus:ring-primary-text/30',
            icon && 'pl-11',
            error ? 'border-error-text/60' : 'border-line-strong',
            className,
          )}
          {...rest}
        />
      </div>
      {error && <p className="text-error-text text-sm mt-1.5 leading-relaxed">{error}</p>}
    </div>
  );
}
