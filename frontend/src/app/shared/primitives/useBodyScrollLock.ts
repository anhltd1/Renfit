import { useEffect } from 'react';

let lockCount = 0;
let previousOverflow = '';

/**
 * Lock document scrolling while an overlay is open (Modal, Sheet, lightbox).
 * Reference-counted so stacked overlays don't unlock each other early.
 */
export function useBodyScrollLock(active: boolean): void {
  useEffect(() => {
    if (!active) return;
    const body = document.body;
    if (lockCount === 0) {
      previousOverflow = body.style.overflow;
      body.style.overflow = 'hidden';
    }
    lockCount += 1;
    return () => {
      lockCount -= 1;
      if (lockCount === 0) body.style.overflow = previousOverflow;
    };
  }, [active]);
}
