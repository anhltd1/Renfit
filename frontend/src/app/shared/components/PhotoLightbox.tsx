/**
 * Fullscreen photo viewer (InBody progress photos).
 *
 * Portalled to <body> so it always covers the whole viewport — including the
 * mobile tab bar — regardless of transformed ancestors. Supports keyboard
 * (←/→/Esc), swipe left/right on touch, and a thumbnail strip to jump between
 * photos. Body scroll is locked while open.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { cn } from '../primitives/cn';
import { useFocusTrap } from '../primitives/useFocusTrap';
import { useBodyScrollLock } from '../primitives/useBodyScrollLock';

export interface PhotoLightboxProps {
  open: boolean;
  photos: string[];
  initialIndex?: number;
  /** Shown in the top bar, e.g. "Ngày đo 12/10/2026". */
  title?: string;
  onClose: () => void;
}

const SWIPE_THRESHOLD = 50;

export function PhotoLightbox({ open, photos, initialIndex = 0, title, onClose }: PhotoLightboxProps) {
  const [index, setIndex] = useState(initialIndex);
  const dialogRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const count = photos.length;

  useFocusTrap(open, dialogRef);
  useBodyScrollLock(open);

  // Reset to the requested photo each time the viewer opens.
  useEffect(() => {
    if (open) setIndex(Math.min(Math.max(initialIndex, 0), Math.max(count - 1, 0)));
  }, [open, initialIndex, count]);

  const go = useCallback(
    (delta: number) => {
      if (count < 2) return;
      setIndex((i) => (i + delta + count) % count);
    },
    [count],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') go(1);
      else if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose, go]);

  if (!open || count === 0) return null;

  const current = photos[index] ?? photos[0];

  return createPortal(
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={title ?? 'Xem ảnh'}
      tabIndex={-1}
      data-testid="lightbox-overlay"
      className="fixed inset-0 z-[300] flex flex-col bg-black/95 backdrop-blur-xl overscroll-contain animate-backdrop-in outline-none"
      style={{
        paddingTop: 'var(--safe-top, 0px)',
        paddingBottom: 'var(--safe-bottom, 0px)',
      }}
    >
      {/* Top bar */}
      <div className="shrink-0 flex items-center gap-3 px-4 py-3 touch-none">
        <div className="flex-1 min-w-0">
          {title && <p className="text-white font-semibold truncate leading-relaxed">{title}</p>}
          {count > 1 && (
            <p className="text-white/60 text-sm leading-relaxed" data-testid="lightbox-counter">
              {index + 1} / {count}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng"
          data-testid="lightbox-close"
          className="w-11 h-11 shrink-0 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors active:scale-[0.97]"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Stage — tap the empty area around the photo to close. Horizontal
          swipes are handled in JS; pinch-zoom stays native. */}
      <div
        className="relative flex-1 min-h-0 flex items-center justify-center px-2 sm:px-16 touch-pinch-zoom"
        onClick={(e) => e.target === e.currentTarget && onClose()}
        onTouchStart={(e) => {
          touchStartX.current = e.touches[0]?.clientX ?? null;
        }}
        onTouchEnd={(e) => {
          const start = touchStartX.current;
          touchStartX.current = null;
          const end = e.changedTouches[0]?.clientX;
          if (start == null || end == null) return;
          const dx = end - start;
          if (Math.abs(dx) >= SWIPE_THRESHOLD) go(dx < 0 ? 1 : -1);
        }}
      >
        <img
          key={current}
          src={current}
          alt={title ? `${title} — ảnh ${index + 1}` : `Ảnh ${index + 1}`}
          data-testid="lightbox-image"
          className="max-w-full max-h-full object-contain rounded-2xl select-none animate-content-in"
          draggable={false}
        />

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Ảnh trước"
              data-testid="lightbox-prev"
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/60 border border-white/10 hover:bg-white/15 flex items-center justify-center text-white transition-colors active:scale-[0.97]"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Ảnh tiếp theo"
              data-testid="lightbox-next"
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/60 border border-white/10 hover:bg-white/15 flex items-center justify-center text-white transition-colors active:scale-[0.97]"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {count > 1 && (
        <div className="shrink-0 flex justify-center gap-2 px-4 py-3 overflow-x-auto touch-pan-x">
          {photos.map((src, i) => (
            <button
              key={`${src}-${i}`}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Xem ảnh ${i + 1}`}
              aria-current={i === index}
              data-testid="lightbox-thumb"
              className={cn(
                'w-14 h-14 shrink-0 rounded-xl overflow-hidden border-2 transition-all duration-[var(--motion-fast)]',
                i === index ? 'border-[#0F6B3E] opacity-100' : 'border-transparent opacity-50 hover:opacity-80',
              )}
            >
              <img src={src} alt="" className="w-full h-full object-cover" loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>,
    document.body,
  );
}
