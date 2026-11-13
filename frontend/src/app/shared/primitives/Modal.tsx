import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';
import { cn } from './cn';
import { useFocusTrap } from './useFocusTrap';
import { useBodyScrollLock } from './useBodyScrollLock';

/**
 * Modal primitive (U1 Foundation) — desktop-oriented centered dialog.
 * DESIGN.md v2: dark scrim (the only place blur is allowed) + opaque overlay panel, viewport-safe.
 * On mobile prefer <Sheet> instead.
 *
 * U8 Accessibility: focus moves into the dialog on open, Tab is trapped
 * inside it while open, and focus returns to whatever triggered it on close
 * (see `useFocusTrap`) — a keyboard-only user can no longer Tab to elements
 * behind the overlay.
 */
export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  className?: string;
  /** PT/ops dialog: adds `ops-surface` to the panel so hover-scale is neutralised inside the portal. */
  ops?: boolean;
  children: React.ReactNode;
}

export function Modal({ open, onClose, title, className, ops = false, children }: ModalProps) {
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

  // Portalled to <body> so transformed ancestors can't clip the overlay.
  return createPortal(
    <div
      data-testid="modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-[2px] overscroll-contain"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={cn(
          'w-full max-w-md rounded-panel border border-line bg-overlay p-6 shadow-[0_16px_48px_rgba(0,0,0,0.5)]',
          'max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain',
          ops && 'ops-surface',
          className,
        )}
      >
        {title && (
          <div className="flex items-start justify-between mb-5">
            <h3 className="text-white font-semibold text-lg leading-relaxed">{title}</h3>
            <button
              type="button"
              data-testid="modal-close"
              onClick={onClose}
              className="tap-target inline-flex items-center justify-center text-white/64 hover:text-white transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary-text rounded"
              aria-label="Đóng"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>,
    document.body,
  );
}
