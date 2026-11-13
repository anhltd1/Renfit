/**
 * Mobile InBody trend chart (U7 Performance & PWA, SPLIT-3).
 * Extracted out of `ProgressScreen.tsx` so `recharts` can be lazy-loaded —
 * only needed once a trainee actually opens the Progress screen, not on
 * initial app paint.
 *
 * Progress photos sit directly under each date on the X axis (same tick as
 * the desktop StackedInbodyChart); tapping one opens the fullscreen viewer.
 */
import { useState } from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { InbodyPhotoTick, PHOTO_TICK_EXTRA } from '../../components/InbodyPhotoTick';
import { PhotoLightbox } from '../../shared/components/PhotoLightbox';
import { resolveApiAsset } from '../../../lib/api/profile';

export interface ProgressChartRow {
  date: string;
  value: number;
  /** Progress-photo URLs for this measurement (first = cover). */
  photos?: string[];
  /** Full date for the viewer title, e.g. "27/10/2026". */
  fullDate?: string;
}

export interface ProgressChartProps {
  data: ProgressChartRow[];
  color: string;
}

export function ProgressChart({ data, color }: ProgressChartProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const hasPhotos = data.some((d) => (d.photos?.length ?? 0) > 0);
  const axisHeight = 24 + (hasPhotos ? PHOTO_TICK_EXTRA : 0);
  const opened = openIndex !== null ? data[openIndex] ?? null : null;

  return (
    <div className="rounded-panel border border-line bg-surface p-2" data-testid="progress-chart">
      <ResponsiveContainer width="100%" height={180 + (hasPhotos ? PHOTO_TICK_EXTRA : 0)}>
        <LineChart data={data} margin={{ top: 12, right: 16, bottom: 4, left: 16 }}>
          <CartesianGrid horizontal vertical={false} stroke="rgba(255,255,255,0.06)" />
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            interval={0}
            height={axisHeight}
            tick={(props: { x?: number; y?: number; index?: number }) => (
              <InbodyPhotoTick
                key={`tick-${props.index}`}
                x={props.x}
                y={props.y}
                index={props.index}
                labels={data.map((d) => d.date)}
                photos={data.map((d) => d.photos)}
                onOpen={setOpenIndex}
                size={34}
                fontSize={10}
              />
            )}
          />
          <YAxis hide />
          <Tooltip
            contentStyle={{ background: '#161616', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12 }}
            labelStyle={{ color: 'rgba(255,255,255,0.4)' }}
          />
          <Line type="linear" dataKey="value" stroke={color} strokeWidth={2} dot={{ r: 3, fill: color, strokeWidth: 0 }} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>

      <PhotoLightbox
        open={opened !== null}
        photos={(opened?.photos ?? []).map(resolveApiAsset)}
        title={opened ? `Ngày đo ${opened.fullDate ?? opened.date}` : undefined}
        onClose={() => setOpenIndex(null)}
      />
    </div>
  );
}
