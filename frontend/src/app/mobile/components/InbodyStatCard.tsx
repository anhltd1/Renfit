/**
 * Compact InBody stat (U4 Trainee Mobile, TS-7, INBODY-1) — DESIGN.md v2.
 * Label over value; the change is signed (−2,4 kg) and coloured by whether
 * that direction is good for THIS metric (`goodWhen`), grey when neutral/zero.
 */
import { cn } from '../../shared/primitives/cn';
import { formatSigned, formatVi } from '../../shared/member/memberHomeModel';

export interface InbodyStatCardProps {
  label: string;
  /** Stable test id suffix (the metric key); defaults to the label. */
  testKey?: string;
  value: number;
  unit: string;
  delta: number | null;
  /** Which direction is an improvement. Defaults to 'down' (body fat). */
  goodWhen?: 'up' | 'down' | 'neutral';
  active?: boolean;
  onClick?: () => void;
}

export function InbodyStatCard({ label, testKey, value, unit, delta, goodWhen = 'down', active, onClick }: InbodyStatCardProps) {
  const r = delta === null ? null : Number(delta.toFixed(1));
  const tone =
    r === null || r === 0 || goodWhen === 'neutral'
      ? 'text-white/64'
      : (goodWhen === 'down') === r < 0
        ? 'text-primary-text'
        : 'text-error-text';

  return (
    <button
      type="button"
      data-testid={`inbody-stat-${testKey ?? label}`}
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        'rounded-panel border p-3 text-left transition-colors bg-surface',
        active ? 'border-white/40' : 'border-line',
      )}
    >
      <p className="text-white/64 text-[13px] font-medium mb-1">{label}</p>
      <p className="text-white text-lg font-semibold leading-tight tabular-nums">
        {formatVi(value)}
        <span className="text-white/64 text-xs font-normal ml-1">{unit}</span>
      </p>
      {r !== null && (
        <span data-testid="inbody-stat-delta" className={cn('text-xs font-medium tabular-nums', tone)}>
          {formatSigned(r)} {unit}
        </span>
      )}
    </button>
  );
}
