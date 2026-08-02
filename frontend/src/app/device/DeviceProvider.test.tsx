import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DeviceProvider } from './DeviceProvider';
import { useDevice } from './useDevice';

function Probe() {
  const { device, isMobile, isDesktop } = useDevice();
  return (
    <div>
      <span data-testid="device">{device}</span>
      <span data-testid="isMobile">{String(isMobile)}</span>
      <span data-testid="isDesktop">{String(isDesktop)}</span>
    </div>
  );
}

/** Install a matchMedia stub for a given viewport + pointer profile. */
function stubEnvironment(width: number, coarse: boolean, noHover: boolean) {
  Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: width });
  window.matchMedia = vi.fn().mockImplementation((query: string) => {
    let matches = false;
    if (query.includes('max-width: 767px')) matches = width < 768;
    else if (query.includes('pointer: coarse')) matches = coarse;
    else if (query.includes('hover: none')) matches = noHover;
    return {
      matches,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    } as unknown as MediaQueryList;
  });
}

describe('DeviceProvider / useDevice', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('resolves mobile on a narrow touch viewport', () => {
    stubEnvironment(390, true, true);
    render(
      <DeviceProvider>
        <Probe />
      </DeviceProvider>,
    );
    expect(screen.getByTestId('device').textContent).toBe('mobile');
    expect(screen.getByTestId('isMobile').textContent).toBe('true');
  });

  it('resolves desktop on a wide mouse viewport', () => {
    stubEnvironment(1440, false, false);
    render(
      <DeviceProvider>
        <Probe />
      </DeviceProvider>,
    );
    expect(screen.getByTestId('device').textContent).toBe('desktop');
    expect(screen.getByTestId('isDesktop').textContent).toBe('true');
  });

  it('forceDevice overrides detection', () => {
    stubEnvironment(1440, false, false);
    render(
      <DeviceProvider forceDevice="mobile">
        <Probe />
      </DeviceProvider>,
    );
    expect(screen.getByTestId('device').textContent).toBe('mobile');
  });

  it('a persisted override wins over the viewport', () => {
    localStorage.setItem('renfit.deviceOverride', 'desktop');
    stubEnvironment(390, true, true);
    render(
      <DeviceProvider>
        <Probe />
      </DeviceProvider>,
    );
    expect(screen.getByTestId('device').textContent).toBe('desktop');
  });

  it('useDevice throws outside a provider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Probe />)).toThrow(/within a <DeviceProvider>/);
    spy.mockRestore();
  });
});
