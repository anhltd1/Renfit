/**
 * Trainer mobile InBody history section (U6 Trainer Mobile, TR-5).
 * Mirrors the desktop InbodySection, opening the Sheet-based AddInbodySheet
 * instead of the desktop Modal-based AddInbodyModal.
 */
import { Suspense, lazy, useCallback, useEffect, useState } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { fetchInbody, type InbodyRecord } from '../../../lib/api/admin';
import { fmtDate } from '../../components/inbodyFormat';
import { AddInbodySheet } from './AddInbodySheet';

/** Lazy-loaded — recharts is only needed once a member's InBody history is opened (SPLIT-3). */
const StackedInbodyChart = lazy(() =>
  import('../../components/InbodyCharts').then((m) => ({ default: m.StackedInbodyChart })),
);

function ChartSkeleton() {
 return <div className="h-[440px] rounded-panel border border-line bg-white/[0.02] animate-pulse" />;
}

export interface InbodySectionMobileProps {
 customerId: string;
}

export function InbodySectionMobile({ customerId }: InbodySectionMobileProps) {
 const [records, setRecords] = useState<InbodyRecord[]>([]);
 const [loading, setLoading] = useState(true);
 const [showSheet, setShowSheet] = useState(false);

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

 return (
 <div className="px-4 py-6 border-t border-line">
 <div className="flex items-center justify-between mb-5">
 <div>
 <h3 className="text-white font-semibold text-sm">InBody — Lịch sử chỉ số</h3>
 <p className="text-white/64 text-xs mt-0.5">
 {records.length} lần đo
 {lastRecord && ` · Gần nhất: ${fmtDate(lastRecord.date_recorded)}`}
 </p>
 </div>
 <button
 type="button"
 onClick={() => setShowSheet(true)}
 className="flex items-center gap-1.5 bg-[#0F6B3E]/15 hover:bg-[#0F6B3E]/25 border border-[#0F6B3E]/30 hover:border-white/20 text-primary-text text-sm px-3 py-2 rounded-control transition-all shrink-0"
 >
 <Plus className="w-3.5 h-3.5" />
 Thêm
 </button>
 </div>

 {loading ? (
 <div className="flex items-center justify-center py-10 text-white/64">
 <RefreshCw className="w-5 h-5 animate-spin" />
 </div>
 ) : (
 <Suspense fallback={<ChartSkeleton />}>
 <StackedInbodyChart records={records} emptyLabel='Chưa có dữ liệu — nhấn "Thêm" để bắt đầu theo dõi.' />
        </Suspense>
      )}

      <AddInbodySheet
        open={showSheet}
        customerId={customerId}
        lastRecord={lastRecord}
        onClose={() => setShowSheet(false)}
        onAdded={handleAdded}
      />
    </div>
  );
}
