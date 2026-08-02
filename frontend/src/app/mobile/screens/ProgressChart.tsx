/**
 * Mobile InBody trend chart (U7 Performance & PWA, SPLIT-3).
 * Extracted out of `ProgressScreen.tsx` so `recharts` can be lazy-loaded —
 * only needed once a trainee actually opens the Progress screen, not on
 * initial app paint.
 */
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export interface ProgressChartRow {
  date: string;
  value: number;
}

export interface ProgressChartProps {
  data: ProgressChartRow[];
  color: string;
}

export function ProgressChart({ data, color }: ProgressChartProps) {
  return (
    <div className="rounded-2xl border border-white/8 bg-[#0D0D0D] p-2" data-testid="progress-chart">
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={data} margin={{ top: 12, right: 12, bottom: 4, left: 0 }}>
          <CartesianGrid horizontal vertical={false} stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
          <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis hide />
          <Tooltip
            contentStyle={{ background: '#161616', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12 }}
            labelStyle={{ color: 'rgba(255,255,255,0.4)' }}
          />
          <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
