import React from 'react';
import { Check, X } from 'lucide-react';
import { createPortal } from 'react-dom';
import { cn } from './cn';

/**
 * Toast primitive (U1 Foundation; U20 adds `action`).
 * Fixed, bottom-centered, viewport-clamped so it never overflows on narrow
 * (<360px) phones. Purely presentational — timing/queueing is handled by
 * `useToast` (shared/hooks) or the caller.
 *
 * - The container is `pointer-events-none` so it never blocks taps on the
 *   page underneath; only the optional action button takes pointer events.
 * - `role="status"` + `aria-live="polite"` on the wrapper announces the text.
 * - Error toasts use a dark surface with the `error-text` token (#f87171)
 *   instead of a red fill: white on #ef4444 is only ~3.8:1.
 */
export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastProps {
  kind: 'ok' | 'err';
  text: string;
  className?: string;
  /** Optional inline action, e.g. "Hoàn tác". */
  action?: ToastAction;
}

export function Toast({ kind, text, className, action }: ToastProps) {
  // Portalled so it anchors to the viewport, not a transformed ancestor.
  // `toast-anchor` (theme.css) lifts it above the mobile tab bar + home indicator.
  return createPortal(
    <div
      role="status"
      aria-live="polite"
      className="toast-anchor fixed left-1/2 -translate-x-1/2 z-[60] px-4 w-full max-w-sm flex justify-center pointer-events-none"
    >
      <div
        data-testid={`toast-${kind}`}
        className={cn(
          'w-full px-4 py-3 rounded-control border border-line bg-overlay text-white shadow-[0_16px_48px_rgba(0,0,0,0.5)] flex items-center gap-2.5 text-sm font-medium',
          kind === 'ok' ? '' : 'border-error-text/40',
          action && 'pr-3',
          className,
        )}
      >
        {kind === 'ok' ? (
          <Check className="w-5 h-5 shrink-0 text-primary-text" aria-hidden="true" />
        ) : (
          <X className="w-5 h-5 shrink-0 text-error-text" aria-hidden="true" />
        )}
        <span className="leading-relaxed flex-1 min-w-0">{text}</span>
        {action && (
          <button
            type="button"
            data-testid="toast-action"
            onClick={action.onClick}
            className={cn(
              'pointer-events-auto tap-target shrink-0 inline-flex items-center justify-center',
              'px-3 rounded-[7px] font-semibold leading-relaxed text-primary-text',
              'hover:bg-surface-3 active:scale-[0.97] transition-colors duration-150',
              'outline-none focus-visible:ring-2 focus-visible:ring-primary-text',
            )}
          >
            {action.label}
          </button>
        )}
      </div>
    </div>,
    document.body,
  );
}
