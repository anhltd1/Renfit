import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { cn } from './cn';
import { useFocusTrap } from './useFocusTrap';

/**
 * Modal primitive (U1 Foundation) — desktop-oriented centered dialog.
 * DESIGN.md: dark overlay + backdrop-blur, glassmorphism panel, viewport-safe.
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
  children: React.ReactNode;
}

export function Modal({ open, onClose, title, className, children }: ModalProps) {
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
      data-testid="modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={cn(
          'w-full max-w-md rounded-3xl border border-white/10 bg-[#0F0F0F]/95 backdrop-blur-xl p-8 shadow-2xl',
          className,
        )}
      >
        {title && (
          <div className="flex items-start justify-between mb-5">
            <h3 className="text-white font-bold text-xl leading-relaxed">{title}</h3>
            <button
              type="button"
              data-testid="modal-close"
              onClick={onClose}
              className="text-white/40 hover:text-white transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#0F6B3E] rounded"
              aria-label="Đóng"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
