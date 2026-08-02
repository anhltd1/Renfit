import { useContext } from 'react';
import { DeviceContext, type DeviceState } from './DeviceContext';

/**
 * Access the resolved device state (U1 Foundation, EN-1).
 * Throws if used outside <DeviceProvider> so misuse fails loudly in dev/tests.
 */
export function useDevice(): DeviceState {
  const ctx = useContext(DeviceContext);
  if (!ctx) {
    throw new Error('useDevice must be used within a <DeviceProvider>.');
  }
  return ctx;
}
