/**
 * Haptic feedback utility (U10 Polish).
 * Fires a short vibration on Android; no-op on iOS/desktop.
 */
export function haptic(ms = 10): void {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(ms);
  }
}
