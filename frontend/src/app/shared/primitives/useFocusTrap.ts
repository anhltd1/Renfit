import { useEffect, type RefObject } from 'react';

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Focus trap for dialog-like overlays (U8 Accessibility). Used by the shared
 * `Modal`/`Sheet` primitives so every screen built on them automatically
 * gets correct keyboard-dialog semantics without repeating this logic:
 * - Moves focus into the dialog when it opens (to the dialog container
 *   itself, or its first focusable descendant if one exists).
 * - Traps Tab/Shift+Tab within the dialog's focusable elements while open.
 * - Returns focus to whatever element triggered the dialog once it closes.
 */
export function useFocusTrap(open: boolean, containerRef: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    if (!open) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const container = containerRef.current;

    const focusables = () =>
      container ? Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)) : [];

    const first = focusables()[0];
    (first ?? container)?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !container) return;
      const items = focusables();
      if (items.length === 0) {
        e.preventDefault();
        return;
      }
      const firstEl = items[0];
      const lastEl = items[items.length - 1];
      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      previouslyFocused?.focus();
    };
  }, [open, containerRef]);
}
