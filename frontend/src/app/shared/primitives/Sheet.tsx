import React, { useEffect, useRef } from 'react';
import { cn } from './cn';
import { useFocusTrap } from './useFocusTrap';

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
  children: React.ReactNode;
}

export function Sheet({ open, onClose, title, className, children }: SheetProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  useFocusTrap(open, dialogRef);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      data-testid="sheet-overlay"
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={cn(
          'w-full max-w-lg rounded-t-3xl border-t border-x border-white/10 bg-[#0F0F0F]/95 backdrop-blur-xl',
          'p-6 pb-[calc(1.5rem+var(--safe-bottom,0px))] shadow-2xl animate-slide-up',
          className,
        )}
      >
        {/* Grab handle */}
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-white/20" aria-hidden />
        {title && <h3 className="text-white font-bold text-lg mb-4 leading-relaxed">{title}</h3>}
        {children}
      </div>
    </div>
  );
}
