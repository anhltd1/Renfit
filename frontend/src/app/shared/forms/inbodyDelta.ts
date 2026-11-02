/**
 * InBody change since the previous record (U24, FR-12) — shown in the save
 * success toast of AddInbodyModal (desktop) and AddInbodySheet (mobile).
 */
export interface InbodyDeltaValues {
  weight: number;
  SMM: number;
  BFM: number;
}

const PARTS: { key: keyof InbodyDeltaValues; label: string }[] = [
  { key: 'weight', label: 'Cân nặng' },
  { key: 'SMM', label: 'Cơ' },
  { key: 'BFM', label: 'Mỡ' },
];

const MINUS = '\u2212'; // proper minus sign "−"

/** "+0.4", "−1.2", "0" — one decimal, Vietnamese-neutral dot separator. */
export function formatSignedDelta(diff: number): string {
  const rounded = Math.round(diff * 10) / 10;
  if (rounded === 0) return '0';
  const abs = Math.abs(rounded).toFixed(1).replace(/\.0$/, '');
  return `${rounded > 0 ? '+' : MINUS}${abs}`;
}

/**
 * "Cân nặng −1.2 kg · Cơ +0.4 kg · Mỡ −0.8 kg". Fields without a usable
 * previous value are skipped; `null` when there is nothing to compare.
 */
export function formatInbodyDelta(
  prev: Partial<Record<keyof InbodyDeltaValues, number | null | undefined>> | null | undefined,
  next: InbodyDeltaValues,
): string | null {
  if (!prev) return null;
  const parts = PARTS.flatMap(({ key, label }) => {
    const p = prev[key];
    const n = next[key];
    if (typeof p !== 'number' || !Number.isFinite(p) || !Number.isFinite(n)) return [];
    return [`${label} ${formatSignedDelta(n - p)} kg`];
  });
  return parts.length ? parts.join(' · ') : null;
}

/** Success toast text: base sentence plus the delta line when available. */
export function inbodySavedText(
  base: string,
  prev: Parameters<typeof formatInbodyDelta>[0],
  next: InbodyDeltaValues,
): string {
  const delta = formatInbodyDelta(prev, next);
  return delta ? `${base} ${delta}` : base;
}
