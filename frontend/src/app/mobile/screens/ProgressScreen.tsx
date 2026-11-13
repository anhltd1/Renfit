/**
 * Mobile InBody progress screen (U4 Trainee Mobile, TS-7, INBODY-1/INBODY-2).
 * Compact combined view: 4 stat cards (tap to pick which metric's trend
 * renders below) instead of the desktop's 4-stacked-row chart, which
 * doesn't fit a phone viewport without horizontal scroll.
 */
import { Suspense, lazy, useMemo, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { useInbodyHistory } from '../../shared/hooks/useInbody';
import { InbodyStatCard } from '../components/InbodyStatCard';
import { StackHeader } from '../shell/StackHeader';
import type { InbodyRecordOut } from '../../../lib/api/profile';

/** Lazy-loaded — recharts is only needed once this screen is actually opened (SPLIT-3). */
const ProgressChart = lazy(() => import('./ProgressChart').then((m) => ({ default: m.ProgressChart })));

function ChartSkeleton() {
 return <div className="h-[180px] rounded-panel border border-line bg-surface animate-pulse" />;
}

export interface ProgressScreenProps {
 customerId: string;
 onBack: () => void;
}

type MetricKey = 'weight' | 'height' | 'SMM' | 'BFM';

// DESIGN.md v2: one hue per chart, on the data — the selected metric is
// always drawn in the data green; polarity says whether a rise is good.
const DATA_HUE = '#3dbe7a';
const METRIC_META: Record<MetricKey, { label: string; unit: string; goodWhen: 'up' | 'down' | 'neutral' }> = {
  weight: { label: 'Cân nặng', unit: 'kg', goodWhen: 'neutral' },
  height: { label: 'Chiều cao', unit: 'cm', goodWhen: 'neutral' },
  SMM: { label: 'Cơ xương', unit: 'kg', goodWhen: 'up' },
  BFM: { label: 'Mỡ cơ thể', unit: 'kg', goodWhen: 'down' },
};

function fmtDate(iso: string): string {
  const [, m, d] = iso.split('-');
  return `${d}/${m}`;
}

export function ProgressScreen({ customerId, onBack }: ProgressScreenProps) {
  const { data, loading } = useInbodyHistory(customerId, 'customer');
  const records = (data ?? []) as InbodyRecordOut[];
  const [metric, setMetric] = useState<MetricKey>('weight');

  const latest = records[records.length - 1];
  const first = records[0];

  const deltas = useMemo(() => {
    if (!latest || !first || records.length < 2) {
      return { weight: null, height: null, SMM: null, BFM: null } as Record<MetricKey, number | null>;
    }
    return {
      weight: latest.weight - first.weight,
      height: latest.height - first.height,
      SMM: latest.SMM - first.SMM,
      BFM: latest.BFM - first.BFM,
    };
  }, [latest, first, records.length]);

  const chartData = records.map((r) => ({
    date: fmtDate(r.date_recorded),
    value: r[metric],
    photos: r.photos,
    fullDate: r.date_recorded.slice(0, 10).split('-').reverse().join('/'),
  }));

  return (
    <div className="flex flex-col min-h-0 flex-1">
      <StackHeader title="Chỉ số InBody" onBack={onBack} />
      <div className="flex-1 overflow-y-auto overscroll-y-contain p-4 space-y-4">
        {loading ? (
          <div className="flex justify-center py-8 text-white/40">
            <RefreshCw className="w-5 h-5 animate-spin" />
          </div>
        ) : records.length === 0 ? (
          <p className="text-white/64 text-sm text-center py-8 leading-relaxed">
            Chưa có dữ liệu InBody. Huấn luyện viên sẽ cập nhật sau mỗi lần đo tại phòng gym.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              {(Object.keys(METRIC_META) as MetricKey[]).map((key) => (
                <InbodyStatCard
                  key={key}
                  testKey={key === 'weight' ? 'Cân nặng' : key === 'height' ? 'Chiều cao' : key}
                  label={METRIC_META[key].label}
                  value={latest[key]}
                  unit={METRIC_META[key].unit}
                  delta={deltas[key]}
                  goodWhen={METRIC_META[key].goodWhen}
                  active={metric === key}
                  onClick={() => setMetric(key)}
                />
              ))}
            </div>

            <Suspense fallback={<ChartSkeleton />}>
              <ProgressChart data={chartData} color={DATA_HUE} />
            </Suspense>
          </>
        )}
      </div>
    </div>
  );
}
