import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { formatInbodyDelta, formatSignedDelta, inbodySavedText } from './inbodyDelta';

describe('formatSignedDelta (example-based)', () => {
  it('uses a proper minus, a plus, one decimal', () => {
    expect(formatSignedDelta(-1.2)).toBe('−1.2');
    expect(formatSignedDelta(0.4)).toBe('+0.4');
    expect(formatSignedDelta(2)).toBe('+2');
    expect(formatSignedDelta(0.04)).toBe('0');
    expect(formatSignedDelta(-0.05000001)).toBe('−0.1');
  });
});

describe('formatInbodyDelta (example-based)', () => {
  it('formats all three fields', () => {
    expect(
      formatInbodyDelta({ weight: 70, SMM: 30, BFM: 15 }, { weight: 68.8, SMM: 30.4, BFM: 14.2 }),
    ).toBe('Cân nặng −1.2 kg · Cơ +0.4 kg · Mỡ −0.8 kg');
  });
  it('skips fields without a previous value', () => {
    expect(formatInbodyDelta({ weight: 70 }, { weight: 71, SMM: 30, BFM: 15 })).toBe('Cân nặng +1 kg');
  });
  it('returns null with no previous record', () => {
    expect(formatInbodyDelta(null, { weight: 70, SMM: 30, BFM: 15 })).toBeNull();
    expect(formatInbodyDelta({}, { weight: 70, SMM: 30, BFM: 15 })).toBeNull();
  });
  it('inbodySavedText appends the delta', () => {
    expect(inbodySavedText('Đã lưu.', { weight: 60, SMM: 25, BFM: 10 }, { weight: 60, SMM: 25, BFM: 10 })).toBe(
      'Đã lưu. Cân nặng 0 kg · Cơ 0 kg · Mỡ 0 kg',
    );
    expect(inbodySavedText('Đã lưu.', null, { weight: 60, SMM: 25, BFM: 10 })).toBe('Đã lưu.');
  });
});

describe('formatSignedDelta (property-based)', () => {
  it('sign matches the rounded difference and never uses an ASCII hyphen', () => {
    const measurementArb = fc.double({ min: 1, max: 250, noNaN: true });
    fc.assert(
      fc.property(measurementArb, measurementArb, (a, b) => {
        const out = formatSignedDelta(b - a);
        expect(out.includes('-')).toBe(false);
        const r = Math.round((b - a) * 10) / 10;
        if (r > 0) expect(out.startsWith('+')).toBe(true);
        else if (r < 0) expect(out.startsWith('−')).toBe(true);
        else expect(out).toBe('0');
      }),
    );
  });
});
