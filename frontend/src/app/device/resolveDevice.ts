/**
 * Pure device-class resolution logic (U1 Foundation, EN-1).
 *
 * Kept as a pure function so it is deterministic and property-testable
 * (see resolveDevice.test.ts). All I/O (matchMedia, resize listeners,
 * localStorage) lives in DeviceProvider — this module never touches the DOM.
 *
 * Rules (see aidlc-docs/.../U1-foundation/functional-design/business-rules.md):
 *  - DR-2: a manual override always wins.
 *  - DR-1: viewport width < 768 (DESIGN.md `md`) resolves to mobile.
 *  - DR-3: touch-like devices (coarse pointer or no hover) below 1024 resolve to mobile.
 *  - otherwise: desktop.
 */

export type DeviceClass = 'desktop' | 'mobile';

/** Mobile breakpoint — matches DESIGN.md `md` (768px). */
export const MOBILE_BREAKPOINT = 768;
/** Upper bound below which touch-like devices are still treated as mobile. */
export const TOUCH_MOBILE_MAX = 1024;

export interface DeviceSignals {
  /** window.innerWidth */
  viewportWidth: number;
  /** matchMedia('(pointer: coarse)').matches */
  coarsePointer: boolean;
  /** matchMedia('(hover: none)').matches */
  noHover: boolean;
  /** Persisted manual override; null = automatic. */
  override: DeviceClass | null;
}

export function resolveDevice(signals: DeviceSignals): DeviceClass {
  const { viewportWidth, coarsePointer, noHover, override } = signals;

  // DR-2: override is absolute.
  if (override === 'desktop' || override === 'mobile') return override;

  // DR-1: narrow viewport is always mobile.
  if (viewportWidth < MOBILE_BREAKPOINT) return 'mobile';

  // DR-3: large phones / small tablets with touch input.
  const isTouchLike = coarsePointer || noHover;
  if (isTouchLike && viewportWidth < TOUCH_MOBILE_MAX) return 'mobile';

  return 'desktop';
}
