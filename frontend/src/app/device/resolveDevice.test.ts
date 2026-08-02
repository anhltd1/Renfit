import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import {
  resolveDevice,
  MOBILE_BREAKPOINT,
  TOUCH_MOBILE_MAX,
  type DeviceClass,
} from './resolveDevice';

// Custom generator for DeviceSignals (PBT-07: domain-appropriate generators).
const signalsArb = fc.record({
  viewportWidth: fc.integer({ min: 200, max: 3840 }),
  coarsePointer: fc.boolean(),
  noHover: fc.boolean(),
  override: fc.constantFrom<DeviceClass | null>('desktop', 'mobile', null),
});

describe('resolveDevice (property-based, PBT-03 invariants)', () => {
  it('always returns exactly "desktop" or "mobile"', () => {
    fc.assert(
      fc.property(signalsArb, (s) => {
        const r = resolveDevice(s);
        return r === 'desktop' || r === 'mobile';
      }),
    );
  });

  it('override always wins over automatic signals', () => {
    fc.assert(
      fc.property(
        signalsArb,
        fc.constantFrom<DeviceClass>('desktop', 'mobile'),
        (s, override) => resolveDevice({ ...s, override }) === override,
      ),
    );
  });

  it('viewport width < 768 resolves to mobile when no override', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 200, max: MOBILE_BREAKPOINT - 1 }),
        fc.boolean(),
        fc.boolean(),
        (viewportWidth, coarsePointer, noHover) =>
          resolveDevice({ viewportWidth, coarsePointer, noHover, override: null }) === 'mobile',
      ),
    );
  });

  it('wide viewport with a fine pointer resolves to desktop', () => {
    fc.assert(
      fc.property(fc.integer({ min: TOUCH_MOBILE_MAX, max: 3840 }), (viewportWidth) =>
        resolveDevice({ viewportWidth, coarsePointer: false, noHover: false, override: null }) ===
        'desktop',
      ),
    );
  });
});

describe('resolveDevice (example-based, PBT-10 pinned cases)', () => {
  it('phone: 390px coarse pointer -> mobile', () => {
    expect(
      resolveDevice({ viewportWidth: 390, coarsePointer: true, noHover: true, override: null }),
    ).toBe('mobile');
  });

  it('desktop: 1440px mouse -> desktop', () => {
    expect(
      resolveDevice({ viewportWidth: 1440, coarsePointer: false, noHover: false, override: null }),
    ).toBe('desktop');
  });

  it('tablet: 900px touch -> mobile (below 1024 touch bound)', () => {
    expect(
      resolveDevice({ viewportWidth: 900, coarsePointer: true, noHover: false, override: null }),
    ).toBe('mobile');
  });

  it('override desktop on a phone viewport -> desktop', () => {
    expect(
      resolveDevice({ viewportWidth: 390, coarsePointer: true, noHover: true, override: 'desktop' }),
    ).toBe('desktop');
  });
});
