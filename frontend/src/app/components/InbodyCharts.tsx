/**
 * Shared InBody stacked-chart components.
 * Used by both the admin dashboard and the customer dashboard.
 */
import {
  CartesianGrid,
  LabelList,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export interface InbodyRecord {
  id: string;
  customer_id: string;
  height: number;
  weight: number;
  SMM: number;
  BFM: number;
  date_recorded: string;
}

interface ChartRow {
  date: string;
  value: number | null;
}

interface MetricDef {
  key: keyof InbodyRecord;
  label: string;
  unit: string;
  color: string;
}

const METRICS: MetricDef[] = [
  { key: 'height', label: 'Chiều cao', unit: 'cm',  color: '#818cf8' },
  { key: 'weight', label: 'Cân nặng',  unit: 'kg',  color: '#0F6B3E' },
  { key: 'SMM',    label: 'SMM',        unit: 'kg',  color: '#f59e0b' },
  { key: 'BFM',    label: 'BFM',        unit: 'kg',  color: '#ef4444' },
];

const MARGIN      = { top: 34, right: 24, bottom: 4, left: 24 };
const XAXIS_MARGIN = { top: 2,  right: 24, bottom: 4, left: 24 };
const MIN_PT_WIDTH    = 80;
const MIN_CHART_POINTS = 5;
const PHANTOM = '__ph_';

export function fmtDate(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y?.slice(2)}`;
}

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
  const realValues = data.filter((d) => d.value !== null).map((d) => d.value as number);
  const min = Math.min(...realValues);
  const max = Math.max(...realValues);
  const pad = (max - min) * 0.35 || Math.abs(min) * 0.15 || 1;
  const yDomain: [number, number] = [
    parseFloat((min - pad).toFixed(2)),
    parseFloat((max + pad).toFixed(2)),
  ];
  const delta =
    realValues.length >= 2
      ? (realValues[realValues.length - 1] - realValues[0]).toFixed(1)
      : null;

  return (
    <div className={`flex items-stretch border-b border-white/6 ${isLast ? 'border-b-0' : ''}`}>
      <div className="w-36 shrink-0 flex flex-col justify-center px-4 border-r border-white/6">
        <p className="font-bold leading-tight text-[17px]" style={{ color: metric.color }}>
          {metric.label}
        </p>
        <p className="text-white/35 text-[15px] mt-0.5">({metric.unit})</p>
        {delta !== null && (
          <span
            className={`text-[15px] mt-1 font-semibold ${
              parseFloat(delta) >= 0 ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {parseFloat(delta) >= 0 ? '▲' : '▼'} {Math.abs(parseFloat(delta))} {metric.unit}
          </span>
        )}
      </div>
      <div className="flex-1 min-w-0 overflow-x-auto">
        <div style={{ minWidth: chartWidth }}>
          <ResponsiveContainer width="100%" height={120}>
            <LineChart data={data} margin={MARGIN} syncId="inbody-stack">
              <CartesianGrid horizontal vertical={false} stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="date" hide padding={{ left: 24, right: 24 }} />
              <YAxis domain={yDomain} hide />
              <Tooltip
                cursor={{ stroke: 'rgba(255,255,255,0.10)', strokeWidth: 1 }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  return (
                    <div className="bg-[#181818] border border-white/10 rounded-lg px-3 py-2 shadow-xl">
                      <span style={{ color: metric.color }} className="text-[17px] font-bold">
                        {(payload[0].value as number).toFixed(1)}
                      </span>
                      <span className="text-white/40 text-[15px] ml-1">{metric.unit}</span>
                    </div>
                  );
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke={metric.color}
                strokeWidth={2}
                dot={{ fill: metric.color, r: 5, strokeWidth: 0 }}
                activeDot={{ fill: metric.color, r: 6, strokeWidth: 2, stroke: '#fff' }}
                isAnimationActive={false}
              >
                <LabelList
                  dataKey="value"
                  position="top"
                  style={{ fill: metric.color, fontSize: 15, fontWeight: 700, fontFamily: 'inherit' }}
                  formatter={(v: number) => v.toFixed(1)}
                />
              </Line>
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

const X_ANGLE = -55;
const X_ROW_HEIGHT = 56;

function XAxisRow({ dates, chartWidth }: { dates: string[]; chartWidth: number }) {
  const data = dates.map((d) => ({ date: d, value: 0 }));
  return (
    <div className="flex items-stretch border-t border-white/6">
      <div className="w-36 shrink-0" />
      <div className="flex-1 min-w-0 overflow-x-auto">
        <div style={{ minWidth: chartWidth }}>
          <ResponsiveContainer width="100%" height={X_ROW_HEIGHT}>
            <LineChart data={data} margin={XAXIS_MARGIN} syncId="inbody-stack">
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'rgba(255,255,255,0.45)', fontSize: 11, fontWeight: 500 }}
                angle={X_ANGLE}
                textAnchor="end"
                padding={{ left: 24, right: 24 }}
                interval={0}
                height={X_ROW_HEIGHT}
                tickFormatter={(v: string) => (v.startsWith(PHANTOM) ? '' : v)}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export function StackedInbodyChart({ records, emptyLabel }: { records: InbodyRecord[]; emptyLabel?: string }) {
  if (records.length === 0) {
    return (
      <p className="text-white/20 text-xs text-center py-10">
        {emptyLabel ?? 'Chưa có dữ liệu InBody.'}
      </p>
    );
  }

  const realDates = records.map((r) => fmtDate(r.date_recorded));
  const phantomCount = Math.max(0, MIN_CHART_POINTS - records.length);
  const allDates = [
    ...realDates,
    ...Array.from({ length: phantomCount }, (_, i) => `${PHANTOM}${i}`),
  ];
  const chartWidth = Math.max(allDates.length, MIN_CHART_POINTS) * MIN_PT_WIDTH;

  return (
    <div className="bg-white/[0.03] border border-white/8 rounded-2xl overflow-hidden">
      {METRICS.map((m, i) => {
        const rowData: ChartRow[] = [
          ...records.map((r) => ({ date: fmtDate(r.date_recorded), value: r[m.key] as number })),
          ...Array.from({ length: phantomCount }, (_, j) => ({ date: `${PHANTOM}${j}`, value: null })),
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
      <XAxisRow dates={allDates} chartWidth={chartWidth} />
    </div>
  );
}
