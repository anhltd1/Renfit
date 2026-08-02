import { createContext } from 'react';
import type { DeviceClass } from './resolveDevice';

/**
 * Device context value (U1 Foundation, EN-1).
 * Kept in its own module so the provider component and the hook can import the
 * context without creating a circular dependency, and so fast-refresh stays happy.
 */
export interface DeviceState {
  device: DeviceClass;
  isMobile: boolean;
  isDesktop: boolean;
  override: DeviceClass | null;
  setOverride(next: DeviceClass | null): void;
}

export const DeviceContext = createContext<DeviceState | null>(null);
