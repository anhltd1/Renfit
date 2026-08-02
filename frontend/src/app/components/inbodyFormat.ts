/**
 * Lightweight InBody date formatter (U7 Performance & PWA, SPLIT-3).
 * Extracted out of `InbodyCharts.tsx` so callers that only need the date
 * label (not the chart itself) don't force-load `recharts` — that module is
 * now lazy-loaded separately at each chart call site.
 */
export function fmtDate(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y?.slice(2)}`;
}
