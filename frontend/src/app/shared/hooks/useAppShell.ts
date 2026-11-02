import { useEffect } from 'react';

/**
 * Native-app shell mode for the mobile dashboards (customer + PT).
 *
 * While mounted:
 * - Adds `html.app-shell`, which (see theme.css) turns off document scrolling
 *   and overscroll, so pulling down/up can no longer drag the whole page —
 *   header and tab bar stay put and only the screen's own scroll area moves.
 * - Publishes the *visual* viewport height as `--app-height`. The shell sizes
 *   itself with it, so when the on-screen keyboard opens the shell shrinks to
 *   fit instead of iOS panning the page (which pushed the header off-screen).
 * - Undoes any residual window scroll iOS applies when focusing an input.
 *
 * The landing page and auth pages don't use this — they keep normal document
 * scrolling.
 */
export function useAppShell(): void {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('app-shell');

    const vv = window.visualViewport;
    const sync = () => {
      // Pinch-zoom also shrinks the visual viewport — don't resize the shell for that.
      if (vv && vv.scale > 1.01) return;
      const h = vv?.height ?? window.innerHeight;
      root.style.setProperty('--app-height', `${Math.round(h)}px`);
    };
    const resetScroll = () => {
      if (window.scrollY !== 0 || window.scrollX !== 0) window.scrollTo(0, 0);
    };

    sync();
    vv?.addEventListener('resize', sync);
    vv?.addEventListener('scroll', resetScroll);
    window.addEventListener('resize', sync);
    window.addEventListener('scroll', resetScroll, { passive: true });

    return () => {
      root.classList.remove('app-shell');
      root.style.removeProperty('--app-height');
      vv?.removeEventListener('resize', sync);
      vv?.removeEventListener('scroll', resetScroll);
      window.removeEventListener('resize', sync);
      window.removeEventListener('scroll', resetScroll);
    };
  }, []);
}
