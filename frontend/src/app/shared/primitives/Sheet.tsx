import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { cn } from './cn';
import { useFocusTrap } from './useFocusTrap';
import { useBodyScrollLock } from './useBodyScrollLock';

/**
 * Sheet primitive (U1 Foundation) — mobile bottom sheet, native-app style.
 * Slides up from the bottom, respects safe-area inset, backdrop tap to close.
 * Replaces centered modals on mobile per the approved mobile navigation pattern.
 *
 * U8 Accessibility: same focus-trap/return-focus behavior as `Modal` (see
 * `useFocusTrap`) — a keyboard-only user can no longer Tab behind the sheet.
 */
export interface SheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  className?: string;
  /** PT/ops sheet: adds `ops-surface` to the panel so hover-scale is neutralised inside the portal. */
  ops?: boolean;
  children: React.ReactNode;
}

export function Sheet({ open, onClose, title, className, ops = false, children }: SheetProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  useFocusTrap(open, dialogRef);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useBodyScrollLock(open);

  if (!open) return null;

  // Portalled to <body>: a transformed ancestor (e.g. a screen mid-entrance
  // animation) would otherwise become the containing block for `fixed` and
  // clip the sheet to the content area, leaving the tab bar exposed.
  return createPortal(
    <div
      data-testid="sheet-overlay"
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-[2px] overscroll-contain"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={cn(
          'w-full max-w-lg rounded-t-panel border-t border-x border-line bg-overlay',
          // Tall forms scroll inside the sheet instead of running off-screen
          // (matters most with the keyboard open, where --app-height shrinks).
          'max-h-[calc(var(--app-height,100dvh)-1.5rem)] overflow-y-auto overscroll-contain',
          'p-5 pb-[calc(1.25rem+var(--safe-bottom,0px))] shadow-[0_-16px_48px_rgba(0,0,0,0.5)] animate-slide-up',
          ops && 'ops-surface',
          className,
        )}
      >
        {/* Grab handle */}
        <div className="mx-auto mb-4 h-1 w-9 rounded-full bg-white/20" aria-hidden />
        {title && <h3 className="text-white font-semibold text-lg mb-4 leading-relaxed">{title}</h3>}
        {children}
      </div>
    </div>,
    document.body,
  );
}
