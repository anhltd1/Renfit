/**
 * InbodyComparison — first-vs-latest InBody two-column comparison (U16).
 * Shows per-metric deltas with color-coded arrows.
 */
import type { InbodyRecord } from '../../lib/api/admin';

interface InbodyComparisonProps {
  first: InbodyRecord;
  latest: InbodyRecord;
}

function fmtDate(iso: string): string {
  if (!iso) return '—';
  const parts = iso.split('-');
  if (parts.length < 3) return iso;
  return `${parts[2]}/${parts[1]}/${parts[0].slice(2)}`;
}

interface MetricRowProps {
  label: string;
  unit: string;
  firstVal: number;
  latestVal: number;
  /** If true, lower is better (weight, BFM). If false, higher is better (SMM). */
  lowerIsBetter: boolean;
}

function MetricRow({ label, unit, firstVal, latestVal, lowerIsBetter }: MetricRowProps) {
  const delta = latestVal - firstVal;
  const improved = lowerIsBetter ? delta < 0 : delta > 0;
  const unchanged = Math.abs(delta) < 0.05;

  return (
    <div className="flex items-center gap-2 py-2 border-b border-white/6 last:border-0">
      <span className="text-white/50 text-xs w-16 shrink-0">{label}</span>
      <span className="text-white/40 text-xs flex-1 text-center tabular-nums">{firstVal.toFixed(1)} {unit}</span>
      <span className="text-white text-xs flex-1 text-center font-medium tabular-nums">{latestVal.toFixed(1)} {unit}</span>
      <span className={`text-xs w-16 text-right shrink-0 font-medium tabular-nums ${
        unchanged ? 'text-white/30' : improved ? 'text-emerald-400' : 'text-red-400'
      }`}>
        {unchanged ? '—' : `${delta > 0 ? '+' : ''}${delta.toFixed(1)}`}
        {!unchanged && (improved ? ' ▼' : ' ▲')}
      </span>
    </div>
  );
}

export function InbodyComparison({ first, latest }: InbodyComparisonProps) {
  return (
    <div className="bg-white/[0.03] border border-white/8 rounded-xl p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-white/70 text-xs font-semibold uppercase tracking-wider">So sánh tiến độ</h4>
      </div>

      {/* Column headers */}
      <div className="flex items-center gap-2 pb-2 border-b border-white/10 mb-1">
        <span className="text-white/30 text-[10px] w-16 shrink-0"></span>
        <span className="text-white/30 text-[10px] flex-1 text-center">Lần đầu ({fmtDate(first.date_recorded)})</span>
        <span className="text-white/30 text-[10px] flex-1 text-center">Mới nhất ({fmtDate(latest.date_recorded)})</span>
        <span className="text-white/30 text-[10px] w-16 text-right shrink-0">Thay đổi</span>
      </div>

      {/* Metrics */}
      <MetricRow label="Cân nặng" unit="kg" firstVal={first.weight} latestVal={latest.weight} lowerIsBetter={true} />
      <MetricRow label="SMM" unit="kg" firstVal={first.SMM} latestVal={latest.SMM} lowerIsBetter={false} />
      <MetricRow label="BFM" unit="kg" firstVal={first.BFM} latestVal={latest.BFM} lowerIsBetter={true} />
      <MetricRow label="Chiều cao" unit="cm" firstVal={first.height} latestVal={latest.height} lowerIsBetter={false} />
    </div>
  );
}
