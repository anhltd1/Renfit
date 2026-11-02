/**
 * Form validation helpers (U20 Ops Foundation, FR-8).
 * Each validator returns a Vietnamese error message, or `null` when valid.
 * Numbers accept a comma as the decimal separator ("70,5").
 */

/** 10 digits starting with 0, after stripping spaces, dots and dashes. Empty is an error. */
export function validateVnPhone(s: string): string | null {
  const digits = s.replace(/[\s.\-]/g, '');
  if (!digits) return 'Vui lòng nhập số điện thoại.';
  if (!/^0\d{9}$/.test(digits)) return 'Số điện thoại phải gồm 10 chữ số và bắt đầu bằng 0.';
  return null;
}

export const AGE_MIN = 10;
export const AGE_MAX = 100;

/** Whole number 10–100 inclusive. Empty is fine unless `required`. */
export function validateAge(s: string, opts: { required?: boolean } = {}): string | null {
  const t = s.trim();
  if (!t) return opts.required ? 'Vui lòng nhập tuổi.' : null;
  if (!/^\d+$/.test(t)) return 'Tuổi phải là số nguyên.';
  const n = Number(t);
  if (n < AGE_MIN || n > AGE_MAX) return `Tuổi phải từ ${AGE_MIN} đến ${AGE_MAX}.`;
  return null;
}

/** Plausible InBody ranges, inclusive. weight/SMM/BFM in kg, height in cm. */
export const INBODY_RANGES = {
  weight: [25, 250],
  height: [100, 230],
  SMM: [5, 80],
  BFM: [1, 150],
} as const satisfies Record<string, readonly [number, number]>;

export type InbodyField = keyof typeof INBODY_RANGES;

const INBODY_LABELS: Record<InbodyField, { label: string; unit: string }> = {
  weight: { label: 'Cân nặng', unit: 'kg' },
  height: { label: 'Chiều cao', unit: 'cm' },
  SMM: { label: 'Khối lượng cơ (SMM)', unit: 'kg' },
  BFM: { label: 'Khối lượng mỡ (BFM)', unit: 'kg' },
};

/** Parse "70.5" / "70,5" → 70.5; anything else → NaN. */
export function parseDecimal(s: string): number {
  const t = s.trim().replace(',', '.');
  return /^\d+(\.\d+)?$/.test(t) ? Number(t) : NaN;
}

/** Required numeric field within `INBODY_RANGES[field]` (inclusive). */
export function validateInbodyField(field: InbodyField, value: string): string | null {
  const { label, unit } = INBODY_LABELS[field];
  if (!value.trim()) return `Vui lòng nhập ${label.toLowerCase()}.`;
  const n = parseDecimal(value);
  if (Number.isNaN(n)) return `${label} phải là số.`;
  const [min, max] = INBODY_RANGES[field];
  if (n < min || n > max) return `${label} phải từ ${min} đến ${max} ${unit}.`;
  return null;
}

/**
 * True when `next` differs from `prev` by MORE than `threshold` (relative,
 * default 10 %). No previous value (or 0) → no warning.
 */
export function changeWarning(prev: number | null | undefined, next: number, threshold = 0.1): boolean {
  if (prev == null || !Number.isFinite(prev) || prev === 0 || !Number.isFinite(next)) return false;
  // Small epsilon so float noise at exactly the threshold doesn't warn.
  return Math.abs(next - prev) / Math.abs(prev) > threshold + 1e-9;
}
