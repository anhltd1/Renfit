/**
 * BodyCompositionRing — SVG donut chart showing muscle vs fat vs rest (U16).
 * Renders three arc segments with a legend.
 */

interface BodyCompositionRingProps {
  smm: number;  // kg (skeletal muscle mass)
  bfm: number;  // kg (body fat mass)
  weight: number;  // kg (total body weight)
  size?: number;  // px, default 140
}

function polarToCartesian(cx: number, cy: number, r: number, angle: number) {
  const rad = ((angle - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(cx: number, cy: number, r: number, startAngle: number, endAngle: number): string {
  if (endAngle - startAngle >= 360) {
    // Full circle — use two arcs
    const mid = startAngle + 180;
    return arcPath(cx, cy, r, startAngle, mid) + ' ' + arcPath(cx, cy, r, mid, endAngle);
  }
  const start = polarToCartesian(cx, cy, r, startAngle);
  const end = polarToCartesian(cx, cy, r, endAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

export function BodyCompositionRing({ smm, bfm, weight, size = 140 }: BodyCompositionRingProps) {
  const rest = Math.max(0, weight - smm - bfm);
  const total = smm + bfm + rest;

  if (total <= 0) {
    return (
      <div className="flex flex-col items-center gap-2">
        <div style={{ width: size, height: size }} className="rounded-full border-2 border-white/10 flex items-center justify-center">
          <span className="text-white/20 text-xs">N/A</span>
        </div>
      </div>
    );
  }

  const smmPct = (smm / total) * 100;
  const bfmPct = (bfm / total) * 100;
  const restPct = (rest / total) * 100;

  const smmAngle = (smm / total) * 360;
  const bfmAngle = (bfm / total) * 360;

  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 12;
  const strokeWidth = 16;

  const smmStart = 0;
  const smmEnd = smmAngle;
  const bfmStart = smmEnd;
  const bfmEnd = bfmStart + bfmAngle;
  const restStart = bfmEnd;
  const restEnd = 360;

  return (
    <div className="flex flex-col items-center gap-3">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
        {/* Rest segment */}
        {restPct > 0 && (
          <path
            d={arcPath(cx, cy, r, restStart, restEnd)}
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
        )}
        {/* BFM segment */}
        {bfmPct > 0 && (
          <path
            d={arcPath(cx, cy, r, bfmStart, bfmEnd)}
            fill="none"
            stroke="#ef4444"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            opacity={0.7}
            className="animate-draw-arc"
            style={{ '--arc-length': `${Math.ceil(2 * Math.PI * r * (bfmPct / 100))}` } as React.CSSProperties}
          />
        )}
        {/* SMM segment */}
        {smmPct > 0 && (
          <path
            d={arcPath(cx, cy, r, smmStart, smmEnd)}
            fill="none"
            stroke="#0F6B3E"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            className="animate-draw-arc"
            style={{ '--arc-length': `${Math.ceil(2 * Math.PI * r * (smmPct / 100))}` } as React.CSSProperties}
          />
        )}
        {/* Center text */}
        <text x={cx} y={cy - 6} textAnchor="middle" className="fill-white text-lg font-bold">
          {weight.toFixed(1)}
        </text>
        <text x={cx} y={cy + 12} textAnchor="middle" className="fill-white/40 text-[10px]">
          kg
        </text>
      </svg>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#0F6B3E]" />
          <span className="text-white/60">Cơ {smmPct.toFixed(0)}%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
          <span className="text-white/60">Mỡ {bfmPct.toFixed(0)}%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
          <span className="text-white/60">Khác {restPct.toFixed(0)}%</span>
        </div>
      </div>
    </div>
  );
}
