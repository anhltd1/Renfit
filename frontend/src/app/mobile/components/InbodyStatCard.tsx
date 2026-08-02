/**
 * Compact InBody stat card (U4 Trainee Mobile, TS-7, INBODY-1).
 * Delta-arrow convention mirrors ChatArtifactCard.tsx's ChangeBadge for
 * visual consistency with the chat artifact the trainee already sees.
 */
import { cn } from '../../shared/primitives/cn';

export interface InbodyStatCardProps {
  label: string;
  value: number;
  unit: string;
  delta: number | null;
  active?: boolean;
  onClick?: () => void;
}

export function InbodyStatCard({ label, value, unit, delta, active, onClick }: InbodyStatCardProps) {
  const positive = delta !== null && delta > 0;
  const zero = delta === 0;
  const deltaColor = zero ? 'text-white/50' : positive ? 'text-red-400' : 'text-emerald-400';
  const arrow = zero ? '' : positive ? '▲' : '▼';

  return (
    <button
      type="button"
      data-testid={`inbody-stat-${label}`}
      onClick={onClick}
      className={cn(
        'rounded-2xl border p-3 text-left transition-all bg-white/5 backdrop-blur-sm',
        active ? 'border-[#0F6B3E]/60' : 'border-white/10',
      )}
    >
      <p className="text-white/40 text-xs mb-1">{label}</p>
      <p className="text-white text-lg font-bold leading-tight">
        {value}
        <span className="text-white/40 text-xs font-normal ml-1">{unit}</span>
      </p>
      {delta !== null && (
        <span className={cn('text-xs font-semibold tabular-nums', deltaColor)}>
          {arrow} {Math.abs(delta).toFixed(1)} {unit}
        </span>
      )}
    </button>
  );
}
