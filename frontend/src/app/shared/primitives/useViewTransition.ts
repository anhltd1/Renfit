/**
 * useViewTransition — wraps a callback in the View Transitions API if available (U19).
 * Progressive enhancement: no-op in unsupported browsers.
 */
export function startViewTransition(callback: () => void): void {
  if ('startViewTransition' in document) {
    (document as any).startViewTransition(callback);
  } else {
    callback();
  }
}
