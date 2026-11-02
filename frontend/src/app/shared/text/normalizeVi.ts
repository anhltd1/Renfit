/**
 * Vietnamese-aware search normalisation (U20 Ops Foundation, FR-7).
 * "Nguyễn" matches "nguyen", "Đức" matches "duc".
 *
 * Order matters for idempotence: lowercase FIRST, then decompose and strip
 * marks. (Lowercasing after stripping would let e.g. "İ" → "i̇" reintroduce a
 * combining dot.)
 */
const COMBINING_MARKS = /[\u0300-\u036f]/g;

export function normalizeVi(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(COMBINING_MARKS, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .trim()
    .replace(/\s+/g, ' ');
}

/**
 * True when every whitespace-separated token of `query` is contained in at
 * least one (normalised) field. Empty/blank query → true. Null-ish fields are
 * ignored.
 */
export function matchesQuery(fields: Array<string | null | undefined>, query: string): boolean {
  const tokens = normalizeVi(query).split(' ').filter(Boolean);
  if (tokens.length === 0) return true;
  const haystack = fields.filter((f): f is string => typeof f === 'string' && f.length > 0).map(normalizeVi);
  return tokens.every((t) => haystack.some((f) => f.includes(t)));
}
