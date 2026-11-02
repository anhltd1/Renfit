/**
 * Desktop admin InBody history section (U5 Trainer Desktop, EXT-1/MODAL-1).
 * Extracted from the combined AdminDashboardPage.tsx; opens the shared-Modal-
 * based AddInbodyModal instead of the old hand-rolled overlay.
 */
import { Suspense, lazy, useCallback, useEffect, useState } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { fetchInbody, type InbodyRecord } from '../../../lib/api/admin';
import { fmtDate } from '../../components/inbodyFormat';
import { AddInbodyModal } from './AddInbodyModal';

/** Lazy-loaded — recharts is only needed once a member's InBody history is opened (SPLIT-3). */
const StackedInbodyChart = lazy(() =>
  import('../../components/InbodyCharts').then((m) => ({ default: m.StackedInbodyChart })),
);

function ChartSkeleton() {
  return <div className="h-[440px] rounded-2xl border border-white/8 bg-white/[0.02] animate-pulse" />;
}

export interface InbodySectionProps {
  customerId: string;
}

export function InbodySection({ customerId }: InbodySectionProps) {
  const [records, setRecords] = useState<InbodyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchInbody(customerId);
      setRecords(data);
    } catch {
      // non-critical — charts just show empty state
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleAdded = (r: InbodyRecord) => {
    setRecords((prev) => [...prev, r].sort((a, b) => a.date_recorded.localeCompare(b.date_recorded)));
  };

  const lastRecord = records.length ? records[records.length - 1] : null;

  // Lives inside the member detail's "Chỉ số InBody" tab, which provides the
  // padding and the tab title — so no own border/padding here.
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-white font-semibold text-sm">Lịch sử chỉ số</h3>
          <p className="text-white/60 text-xs mt-0.5">
            {records.length} lần đo
            {lastRecord && ` · Gần nhất: ${fmtDate(lastRecord.date_recorded)}`}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="tap-target flex items-center gap-1.5 bg-[#0F6B3E]/15 hover:bg-[#0F6B3E]/25 border border-[#0F6B3E]/30 hover:border-[#0F6B3E]/50 text-primary-text text-sm px-3 py-2 rounded-xl transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Thêm kết quả
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-10 text-white/60">
          <RefreshCw className="w-5 h-5 animate-spin" />
        </div>
      ) : (
        <Suspense fallback={<ChartSkeleton />}>
          <StackedInbodyChart records={records} emptyLabel='Chưa có dữ liệu — nhấn "Thêm kết quả" để bắt đầu theo dõi.' />
        </Suspense>
      )}

      <AddInbodyModal
        open={showModal}
        customerId={customerId}
        lastRecord={lastRecord}
        onClose={() => setShowModal(false)}
        onAdded={handleAdded}
      />
    </div>
  );
}
