import React from 'react';
import { Check, X } from 'lucide-react';
import { cn } from './cn';

/**
 * Toast primitive (U1 Foundation).
 * Fixed, bottom-centered, viewport-clamped so it never overflows on narrow
 * (<360px) phones. Purely presentational — timing/queueing handled by callers.
 */
export interface ToastProps {
  kind: 'ok' | 'err';
  text: string;
  className?: string;
}

export function Toast({ kind, text, className }: ToastProps) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 w-full max-w-sm flex justify-center">
      <div
        role="status"
        data-testid={`toast-${kind}`}
        className={cn(
          'w-full px-6 py-3.5 rounded-xl border shadow-2xl flex items-center gap-2.5 text-base font-medium',
          kind === 'ok'
            ? 'bg-[#0F6B3E] border-[#0F6B3E]/60 text-white'
            : 'bg-red-500 border-red-500/60 text-white',
          className,
        )}
      >
        {kind === 'ok' ? <Check className="w-5 h-5 shrink-0" /> : <X className="w-5 h-5 shrink-0" />}
        <span className="leading-relaxed">{text}</span>
      </div>
    </div>
  );
}
