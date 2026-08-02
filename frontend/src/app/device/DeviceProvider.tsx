import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { resolveDevice, type DeviceClass, type DeviceSignals } from './resolveDevice';
import { DeviceContext, type DeviceState } from './DeviceContext';

/**
 * DeviceProvider (U1 Foundation, EN-1).
 *
 * Resolves the device class from live browser signals (viewport width, pointer
 * coarseness, hover capability) plus an optional persisted manual override, and
 * exposes it via context. Resolves synchronously on first render to avoid a
 * desktop->mobile flash (DR-5), then subscribes to matchMedia/resize changes (DR-4).
 *
 * `forceDevice` bypasses detection entirely — used by tests and Storybook, and
 * as the backing for a future "view desktop site" toggle.
 */

const OVERRIDE_KEY = 'renfit.deviceOverride';

function readSignals(override: DeviceClass | null): DeviceSignals {
  // Guard for non-browser / older environments (SSR, jsdom without matchMedia).
  const hasWindow = typeof window !== 'undefined';
  const mm = hasWindow && typeof window.matchMedia === 'function'
    ? window.matchMedia
    : null;
  return {
    viewportWidth: hasWindow ? window.innerWidth : 1280,
    coarsePointer: mm ? mm('(pointer: coarse)').matches : false,
    noHover: mm ? mm('(hover: none)').matches : false,
    override,
  };
}

function readStoredOverride(): DeviceClass | null {
  try {
    const v = localStorage.getItem(OVERRIDE_KEY);
    return v === 'desktop' || v === 'mobile' ? v : null;
  } catch {
    return null;
  }
}

export interface DeviceProviderProps {
  children: React.ReactNode;
  /** Force a device class (tests/Storybook); skips detection. */
  forceDevice?: DeviceClass;
}

export function DeviceProvider({ children, forceDevice }: DeviceProviderProps) {
  const [override, setOverrideState] = useState<DeviceClass | null>(() =>
    forceDevice ? forceDevice : readStoredOverride(),
  );

  // Resolve synchronously on first render (no flash of the wrong tree).
  const [device, setDevice] = useState<DeviceClass>(() =>
    forceDevice ? forceDevice : resolveDevice(readSignals(readStoredOverride())),
  );

  const overrideRef = useRef(override);
  overrideRef.current = override;

  const recompute = useCallback(() => {
    if (forceDevice) {
      setDevice(forceDevice);
      return;
    }
    setDevice(resolveDevice(readSignals(overrideRef.current)));
  }, [forceDevice]);

  // Subscribe to viewport / capability changes (DR-4).
  useEffect(() => {
    if (forceDevice || typeof window === 'undefined') return;
    recompute();
    const queries = [
      window.matchMedia(`(max-width: 767px)`),
      window.matchMedia(`(pointer: coarse)`),
      window.matchMedia(`(hover: none)`),
    ];
    queries.forEach((q) => q.addEventListener('change', recompute));
    window.addEventListener('resize', recompute);
    window.addEventListener('orientationchange', recompute);
    return () => {
      queries.forEach((q) => q.removeEventListener('change', recompute));
      window.removeEventListener('resize', recompute);
      window.removeEventListener('orientationchange', recompute);
    };
  }, [forceDevice, recompute]);

  const setOverride = useCallback(
    (next: DeviceClass | null) => {
      setOverrideState(next);
      try {
        if (next) localStorage.setItem(OVERRIDE_KEY, next);
        else localStorage.removeItem(OVERRIDE_KEY);
      } catch {
        /* ignore storage errors */
      }
      // Recompute immediately with the new override.
      if (!forceDevice) setDevice(resolveDevice(readSignals(next)));
    },
    [forceDevice],
  );

  const value = useMemo<DeviceState>(
    () => ({
      device,
      isMobile: device === 'mobile',
      isDesktop: device === 'desktop',
      override,
      setOverride,
    }),
    [device, override, setOverride],
  );

  return <DeviceContext.Provider value={value}>{children}</DeviceContext.Provider>;
}
