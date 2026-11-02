import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { matchesQuery, normalizeVi } from './normalizeVi';

// Base letters → their Vietnamese accented forms (lower + upper).
const VI_VARIANTS: Record<string, string> = {
  a: 'aàáảãạăằắẳẵặâầấẩẫậAÀÁẢÃẠĂẰẮẲẴẶÂẦẤẨẪẬ',
  e: 'eèéẻẽẹêềếểễệEÈÉẺẼẸÊỀẾỂỄỆ',
  i: 'iìíỉĩịIÌÍỈĨỊ',
  o: 'oòóỏõọôồốổỗộơờớởỡợOÒÓỎÕỌÔỒỐỔỖỘƠỜỚỞỠỢ',
  u: 'uùúủũụưừứửữựUÙÚỦŨỤƯỪỨỬỮỰ',
  y: 'yỳýỷỹỵYỲÝỶỸỴ',
  d: 'dđDĐ',
};
const BASE_CHARS = 'abcdeghiklmnopqrstuvxy ';

/** Plain lowercase Vietnamese-alphabet strings (incl. spaces). */
const baseArb = fc
  .array(fc.constantFrom(...BASE_CHARS.split('')), { maxLength: 24 })
  .map((cs) => cs.join(''));

/** A base string paired with an accented/case-varied Vietnamese equivalent. */
const accentedPairArb = baseArb.chain((base) =>
  fc
    .tuple(
      ...base.split('').map((c) => {
        const variants = VI_VARIANTS[c];
        return variants
          ? fc.constantFrom(...Array.from(variants))
          : fc.constantFrom(c, c.toUpperCase());
      }),
    )
    .map((chars) => ({ base, accented: (chars as string[]).join('') })),
);

const MARKS = Array.from({ length: 0x70 }, (_, i) => String.fromCharCode(0x300 + i));

/** A base string with random combining marks inserted at random positions. */
const withMarksArb = baseArb.chain((base) =>
  fc
    .array(fc.tuple(fc.nat({ max: base.length }), fc.constantFrom(...MARKS)), { maxLength: 8 })
    .map((inserts) => {
      const chars = base.split('');
      // Insert from the right so earlier indices stay valid.
      [...inserts].sort((x, y) => y[0] - x[0]).forEach(([at, m]) => chars.splice(at, 0, m));
      return { base, marked: chars.join('') };
    }),
);

/** Mixed real-world-ish text: Vietnamese letters, ASCII, digits, whitespace. */
const textArb = fc
  .array(
    fc.oneof(
      fc.constantFrom(...Object.values(VI_VARIANTS).join('').split('')),
      fc.constantFrom(...'abcxyz0123456789 \t\n.-'.split('')),
      fc.constantFrom(...MARKS),
    ),
    { maxLength: 32 },
  )
  .map((cs) => cs.join(''));

describe('normalizeVi (property-based, fast-check)', () => {
  it('is idempotent', () => {
    fc.assert(fc.property(textArb, (s) => normalizeVi(normalizeVi(s)) === normalizeVi(s)));
  });

  it('is idempotent on arbitrary unicode', () => {
    fc.assert(fc.property(fc.fullUnicodeString({ maxLength: 20 }), (s) => normalizeVi(normalizeVi(s)) === normalizeVi(s)));
  });

  it('ignores Vietnamese accents and case', () => {
    fc.assert(
      fc.property(accentedPairArb, ({ base, accented }) => normalizeVi(accented) === normalizeVi(base)),
    );
  });

  it('ignores inserted combining marks', () => {
    fc.assert(fc.property(withMarksArb, ({ base, marked }) => normalizeVi(marked) === normalizeVi(base)));
  });

  it('never outputs combining marks, đ, or leading/trailing/double spaces', () => {
    fc.assert(
      fc.property(textArb, (s) => {
        const out = normalizeVi(s);
        return !/[\u0300-\u036f]/.test(out) && !/[đĐ]/.test(out) && out === out.trim() && !/\s{2,}/.test(out);
      }),
    );
  });
});

describe('normalizeVi (example-based)', () => {
  it('normalises common names', () => {
    expect(normalizeVi('Nguyễn')).toBe('nguyen');
    expect(normalizeVi('  Trần   Thị  Đức ')).toBe('tran thi duc');
    expect(normalizeVi('ĐỖ')).toBe('do');
    expect(normalizeVi('đ')).toBe('d');
  });
});

describe('matchesQuery (example-based)', () => {
  it('treats empty/blank query as a match', () => {
    expect(matchesQuery(['A'], '')).toBe(true);
    expect(matchesQuery([], '   ')).toBe(true);
  });

  it('matches accent-insensitively across fields', () => {
    expect(matchesQuery(['Nguyễn Văn An', '0901234567'], 'nguyen an')).toBe(true);
    expect(matchesQuery(['Nguyễn Văn An', '0901234567'], 'van 0901')).toBe(true);
    expect(matchesQuery(['Nguyễn Văn An', null, undefined], 'Đức')).toBe(false);
  });

  it('requires every token to match', () => {
    expect(matchesQuery(['Lê Minh'], 'le hoa')).toBe(false);
  });
});
