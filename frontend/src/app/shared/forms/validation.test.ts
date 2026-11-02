import { describe, it, expect } from 'vitest';
import { INBODY_RANGES, changeWarning, validateAge, validateInbodyField, validateVnPhone } from './validation';

describe('validateVnPhone', () => {
  it('accepts 10 digits starting with 0, ignoring spaces/dots/dashes', () => {
    expect(validateVnPhone('0901234567')).toBeNull();
    expect(validateVnPhone('090 123 4567')).toBeNull();
    expect(validateVnPhone('090.123-4567')).toBeNull();
  });

  it('rejects empty, wrong length, wrong prefix, letters', () => {
    expect(validateVnPhone('')).toMatch(/số điện thoại/);
    expect(validateVnPhone('090123456')).not.toBeNull();
    expect(validateVnPhone('09012345678')).not.toBeNull();
    expect(validateVnPhone('1901234567')).not.toBeNull();
    expect(validateVnPhone('09012345a7')).not.toBeNull();
    expect(validateVnPhone('+84901234567')).not.toBeNull();
  });
});

describe('validateAge', () => {
  it('is inclusive at 10 and 100', () => {
    expect(validateAge('10')).toBeNull();
    expect(validateAge('100')).toBeNull();
    expect(validateAge('9')).not.toBeNull();
    expect(validateAge('101')).not.toBeNull();
  });

  it('allows empty unless required', () => {
    expect(validateAge('')).toBeNull();
    expect(validateAge('  ')).toBeNull();
    expect(validateAge('', { required: true })).not.toBeNull();
  });

  it('rejects non-integers', () => {
    expect(validateAge('25.5')).not.toBeNull();
    expect(validateAge('abc')).not.toBeNull();
  });
});

describe('validateInbodyField', () => {
  it('accepts inclusive boundaries for every field', () => {
    for (const [field, [min, max]] of Object.entries(INBODY_RANGES) as Array<[keyof typeof INBODY_RANGES, readonly [number, number]]>) {
      expect(validateInbodyField(field, String(min))).toBeNull();
      expect(validateInbodyField(field, String(max))).toBeNull();
      expect(validateInbodyField(field, String(min - 0.1))).not.toBeNull();
      expect(validateInbodyField(field, String(max + 0.1))).not.toBeNull();
    }
  });

  it('accepts comma decimals and rejects empty / non-numbers', () => {
    expect(validateInbodyField('weight', '70,5')).toBeNull();
    expect(validateInbodyField('weight', '')).not.toBeNull();
    expect(validateInbodyField('height', 'abc')).not.toBeNull();
  });
});

describe('changeWarning', () => {
  it('warns only above the threshold', () => {
    expect(changeWarning(100, 110)).toBe(false); // exactly 10 %
    expect(changeWarning(100, 110.1)).toBe(true);
    expect(changeWarning(100, 89.9)).toBe(true);
    expect(changeWarning(70, 72)).toBe(false);
    expect(changeWarning(70, 80, 0.2)).toBe(false);
  });

  it('never warns without a previous value', () => {
    expect(changeWarning(null, 70)).toBe(false);
    expect(changeWarning(undefined, 70)).toBe(false);
    expect(changeWarning(0, 70)).toBe(false);
  });
});
