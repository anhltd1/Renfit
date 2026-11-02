/**
 * Shared InBody stacked-chart components.
 * Used by both the admin dashboard and the customer dashboard.
 */
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useState } from 'react';
import { fmtDate } from './inbodyFormat';
import { InbodyPhotoTick, PHOTO_TICK_EXTRA } from './InbodyPhotoTick';
import { PhotoLightbox } from '../shared/components/PhotoLightbox';
import { resolveApiAsset } from '../../lib/api/profile';

export interface InbodyRecord {
  id: string;
  customer_id: string;
  height: number;
  weight: number;
  SMM: number;
  BFM: number;
  date_recorded: string;
  /** Progress-photo URLs (first = cover), shown under the record's date. */
  photos?: string[];
}

type MetricKey = 'height' | 'weight' | 'SMM' | 'BFM';

interface ChartRow {
  date: string;
  displayDate: string;
  value: number | null;
}

interface MetricDef {
  key: MetricKey;
  label: string;
  unit: string;
  color: string;
}

const METRICS: MetricDef[] = [
  { key: 'height', label: 'Chiều cao', unit: 'cm', color: '#818cf8' },
  { key: 'weight', label: 'Cân nặng',  unit: 'kg', color: '#22c55e' },
  { key: 'SMM',    label: 'SMM',        unit: 'kg', color: '#f59e0b' },
  { key: 'BFM',    label: 'BFM',        unit: 'kg', color: '#ef4444' },
];

const MIN_CHART_POINTS = 5;
const PHANTOM = '__ph_';

export { fmtDate };

function fmtVal(v: number): string {
  return Number.isInteger(v) ? String(v) : v.toFixed(1);
}

// ── Custom tooltip ──────────────────────────────────────────────────────────
function MetricTooltip({
  active,
  payload,
  metric,
}: {
  active?: boolean;
  payload?: { payload: ChartRow; value: number }[];
  metric: MetricDef;
}) {
  if (!active || !payload?.length || payload[0].value == null) return null;
  const row = payload[0].payload;
  return (
    <div className="bg-[#161616] border border-white/12 rounded-xl px-3.5 py-2.5 shadow-2xl pointer-events-none">
      <p className="text-white/40 text-[11px] mb-1">{row.displayDate}</p>
      <p className="font-bold text-base leading-none" style={{ color: metric.color }}>
        {fmtVal(payload[0].value)}
        <span className="text-white/40 text-xs font-normal ml-1">{metric.unit}</span>
      </p>
    </div>
  );
}

// ── Single metric row ───────────────────────────────────────────────────────
function MetricRow({
  data,
  metric,
  chartWidth,
  isLast,
}: {
  data: ChartRow[];
  metric: MetricDef;
  chartWidth: number;
  isLast: boolean;
}) {
  const realValues = data
    .filter((d) => d.value !== null && !d.date.startsWith(PHANTOM))
    .map((d) => d.value as number);

  const delta =
    realValues.length >= 2
      ? realValues[realValues.length - 1] - realValues[0]
      : null;

  const min = realValues.length ? Math.min(...realValues) : 0;
  const max = realValues.length ? Math.max(...realValues) : 1;
  const range = max - min || 1;
  const pad = range * 0.45;
  const yDomain: [number, number] = [
    parseFloat((min - pad).toFixed(1)),
    parseFloat((max + pad).toFixed(1)),
  ];

  // Reference line at the last real value for visual anchoring
  const lastVal = realValues[realValues.length - 1];

  return (
    <div className={`flex items-stretch ${!isLast ? 'border-b border-white/[0.06]' : ''}`}>
      {/* Left label */}
      <div className="w-32 shrink-0 flex flex-col justify-center px-4 py-3 border-r border-white/[0.06]">
        <p className="font-bold text-sm leading-tight" style={{ color: metric.color }}>
          {metric.label}
        </p>
        <p className="text-white/30 text-xs mt-0.5">({metric.unit})</p>
        {delta !== null && (
          <span
            className={`text-xs mt-1.5 font-semibold tabular-nums ${
              delta >= 0 ? 'text-emerald-400' : 'text-red-400'
            }`}
          >
            {delta >= 0 ? '▲' : '▼'} {Math.abs(delta).toFixed(1)} {metric.unit}
          </span>
        )}
      </div>

      {/* Chart */}
      <div className="flex-1 min-w-0 overflow-x-auto">
        <div style={{ minWidth: chartWidth }}>
          <ResponsiveContainer width="100%" height={110}>
            <LineChart data={data} margin={{ top: 18, right: 20, bottom: 8, left: 0 }} syncId="inbody">
              <CartesianGrid
                horizontal
                vertical={false}
                stroke="rgba(255,255,255,0.04)"
                strokeDasharray="4 4"
              />
              <XAxis dataKey="date" hide padding={{ left: 20, right: 20 }} />
              <YAxis domain={yDomain} hide />
              {lastVal != null && (
                <ReferenceLine
                  y={lastVal}
                  stroke={metric.color}
                  strokeOpacity={0.12}
                  strokeDasharray="4 4"
                />
              )}
              <Tooltip
                cursor={{ stroke: 'rgba(255,255,255,0.08)', strokeWidth: 1, strokeDasharray: '4 4' }}
                content={({ active, payload }) => (
                  <MetricTooltip
                    active={active}
                    payload={payload as { payload: ChartRow; value: number }[]}
                    metric={metric}
                  />
                )}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke={metric.color}
                strokeWidth={2}
                dot={(props) => {
                  const { cx, cy, payload } = props as { cx: number; cy: number; payload: ChartRow };
                  if (payload.date.startsWith(PHANTOM) || payload.value == null) return <g key={payload.date} />;
                  return (
                    <g key={payload.date}>
                      <circle cx={cx} cy={cy} r={4} fill={metric.color} />
                      <text
                        x={cx}
                        y={cy - 10}
                        textAnchor="middle"
                        fill={metric.color}
                        fontSize={11}
                        fontWeight={700}
                        fontFamily="inherit"
                      >
                        {fmtVal(payload.value)}
                      </text>
                    </g>
                  );
                }}
                activeDot={{ fill: metric.color, r: 6, strokeWidth: 2, stroke: '#fff' }}
                connectNulls={false}
                isAnimationActive={true}
                animationDuration={600}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// ── X-axis date strip (+ photo thumbnails under each date) ─────────────────
function XAxisRow({
  dates,
  displayDates,
  photos,
  chartWidth,
  onOpenPhotos,
}: {
  dates: string[];
  displayDates: string[];
  photos: (string[] | undefined)[];
  chartWidth: number;
  onOpenPhotos: (index: number) => void;
}) {
  const data = dates.map((d, i) => ({ date: d, value: 0, displayDate: displayDates[i] ?? '' }));
  const hasPhotos = photos.some((p) => (p?.length ?? 0) > 0);
  const height = 44 + (hasPhotos ? PHOTO_TICK_EXTRA : 0);
  return (
    <div className="flex items-stretch border-t border-white/[0.06]">
      <div className="w-32 shrink-0 flex items-end px-4 pb-4">
        {hasPhotos && <span className="text-white/30 text-xs leading-relaxed">Ảnh buổi đo</span>}
      </div>
      <div className="flex-1 min-w-0 overflow-x-auto">
        <div style={{ minWidth: chartWidth }}>
          <ResponsiveContainer width="100%" height={height}>
            <LineChart data={data} margin={{ top: 0, right: 20, bottom: 0, left: 0 }} syncId="inbody">
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                padding={{ left: 20, right: 20 }}
                interval={0}
                height={height}
                tick={(props: { x?: number; y?: number; index?: number }) => (
                  <InbodyPhotoTick
                    key={`tick-${props.index}`}
                    x={props.x}
                    y={props.y}
                    index={props.index}
                    labels={displayDates}
                    photos={photos}
                    onOpen={onOpenPhotos}
                  />
                )}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function fmtFullDate(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split('-');
  return d && m && y ? `${d}/${m}/${y}` : iso;
}

// ── Public component ────────────────────────────────────────────────────────
export function StackedInbodyChart({
  records,
  emptyLabel,
}: {
  records: InbodyRecord[];
  emptyLabel?: string;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (records.length === 0) {
    return (
      <p className="text-white/20 text-xs text-center py-10">
        {emptyLabel ?? 'Chưa có dữ liệu InBody.'}
      </p>
    );
  }

  const phantomCount = Math.max(0, MIN_CHART_POINTS - records.length);
  const realDates     = records.map((r) => fmtDate(r.date_recorded));
  const allDates      = [
    ...realDates,
    ...Array.from({ length: phantomCount }, (_, i) => `${PHANTOM}${i}`),
  ];
  const displayDates  = [
    ...realDates,
    ...Array.from({ length: phantomCount }, () => ''),
  ];

  // 90px per point, minimum 5 points wide
  const chartWidth = Math.max(allDates.length, MIN_CHART_POINTS) * 90;

  const opened = openIndex !== null ? records[openIndex] ?? null : null;

  return (
    <div className="rounded-2xl overflow-hidden border border-white/8 bg-[#0D0D0D]">
      {METRICS.map((m, i) => {
        const rowData: ChartRow[] = [
          ...records.map((r) => ({
            date: fmtDate(r.date_recorded),
            displayDate: fmtDate(r.date_recorded),
            value: r[m.key] as number,
          })),
          ...Array.from({ length: phantomCount }, (_, j) => ({
            date: `${PHANTOM}${j}`,
            displayDate: '',
            value: null,
          })),
        ];
        return (
          <MetricRow
            key={m.key}
            data={rowData}
            metric={m}
            chartWidth={chartWidth}
            isLast={i === METRICS.length - 1}
          />
        );
      })}
      <XAxisRow
        dates={allDates}
        displayDates={displayDates}
        photos={records.map((r) => r.photos)}
        chartWidth={chartWidth}
        onOpenPhotos={setOpenIndex}
      />
      <PhotoLightbox
        open={opened !== null}
        photos={(opened?.photos ?? []).map(resolveApiAsset)}
        title={opened ? `Ngày đo ${fmtFullDate(opened.date_recorded)}` : undefined}
        onClose={() => setOpenIndex(null)}
      />
    </div>
  );
}
