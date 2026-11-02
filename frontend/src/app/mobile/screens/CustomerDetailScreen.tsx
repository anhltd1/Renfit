/**
 * Trainer mobile customer detail screen (U6 Trainer Mobile, TR-2, DETAIL-1).
 * Pushed via the "clients" tab's useStack(); same content/order as the
 * desktop CustomerDetail (hero, detail rows, InBody section), but a
 * mobile-tree-only file per the shared/desktop/mobile import-isolation rule.
 *
 * U24 (FR-4): Sửa (MemberFormModal → Sheet on mobile) and Đã nghỉ (confirm) /
 * Khôi phục (direct), with toasts + busy state — same flow as desktop
 * CustomerDetail.setActive. Attendance summary "Đã tập N · Vắng M" (FR-1).
 */
import { useState } from 'react';
import { Activity, Archive, Loader2, MapPin, Pencil, Phone, User, Weight } from 'lucide-react';
import type { CustomerSummary } from '../../../lib/api/admin';
import { archiveMember, restoreMember } from '../../../lib/api/admin';
import { StackHeader } from '../shell/StackHeader';
import { InbodySectionMobile } from '../components/InbodySectionMobile';
import { TrainerNotes } from '../../components/TrainerNotes';
import { MemberFormModal } from '../../components/MemberFormModal';
import { ConfirmDialog } from '../../shared/components/ConfirmDialog';
import { useToast } from '../../shared/hooks/useToast';
import { AttendanceSummary } from '../../shared/clients/AttendanceSummary';
import { cn } from '../../shared/primitives/cn';

export interface CustomerDetailScreenProps {
  customer: CustomerSummary;
  onBack: () => void;
  /** Reload the customer list after an edit / archive / restore. */
  onChanged?: () => void | Promise<void>;
}

function DetailFieldMobile({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex gap-3 py-3 border-b border-white/6 last:border-0">
      <div className="w-8 h-8 rounded-xl bg-[#0F6B3E]/12 flex items-center justify-center shrink-0 mt-0.5">
        <span className="text-primary-text">{icon}</span>
      </div>
      <div>
        <p className="text-white/60 text-xs leading-relaxed mb-0.5">{label}</p>
        <p className="text-white/90 text-sm leading-relaxed">{value}</p>
      </div>
    </div>
  );
}

export function CustomerDetailScreen({ customer, onBack, onChanged }: CustomerDetailScreenProps) {
  const [editing, setEditing] = useState(false);
  const [confirmArchive, setConfirmArchive] = useState(false);
  const [statusBusy, setStatusBusy] = useState(false);
  const { show, node: toastNode } = useToast();
  const archived = customer.active === false;

  const reload = () => {
    try {
      void Promise.resolve(onChanged?.()).catch(() => {});
    } catch {
      /* ignore */
    }
  };

  // Same flow as desktop CustomerDetail.setActive (U21 FR-3).
  const setActive = async (active: boolean) => {
    const name = customer.id;
    setStatusBusy(true);
    try {
      if (active) await restoreMember(name);
      else await archiveMember(name);
      show({ kind: 'ok', text: active ? `Đã khôi phục ${name}.` : `Đã chuyển ${name} sang Đã nghỉ.` });
      setConfirmArchive(false);
      reload();
    } catch (e) {
      show({
        kind: 'err',
        text:
          e instanceof Error && e.message
            ? e.message
            : active
              ? 'Không thể khôi phục hội viên. Vui lòng thử lại.'
              : 'Không thể chuyển hội viên sang Đã nghỉ. Vui lòng thử lại.',
      });
      setConfirmArchive(false);
    } finally {
      setStatusBusy(false);
    }
  };

  return (
    <div className="flex flex-col min-h-0 flex-1">
      <StackHeader title={customer.id} onBack={onBack} />
      <div className="flex-1 overflow-y-auto overscroll-y-contain">
        {/* Hero */}
        <div className="flex flex-col items-center gap-3 py-6 px-6 border-b border-white/8">
          {customer.avatar ? (
            <img
              src={customer.avatar}
              alt={customer.id}
              className="w-24 h-24 rounded-full object-cover border-2 border-[#0F6B3E]/40"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-[#0F6B3E]/15 border-2 border-[#0F6B3E]/30 flex items-center justify-center">
              <User className="w-10 h-10 text-primary-text" aria-hidden="true" />
            </div>
          )}
          <div className="text-center">
            <h2 className="text-xl font-bold text-white leading-relaxed">{customer.id}</h2>
            <p className="text-white/60 text-sm flex items-center justify-center gap-1.5 mt-1 tabular-nums">
              <Phone className="w-3.5 h-3.5" aria-hidden="true" />
              {customer.phone_number}
            </p>
            {customer.goal && (
              <span className="inline-block mt-2 bg-[#0F6B3E]/15 text-primary-text text-xs px-3 py-1 rounded-full border border-[#0F6B3E]/25">
                {customer.goal}
              </span>
            )}
            {archived && (
              <span className="inline-flex items-center gap-1 mt-2 ml-2 text-xs px-3 py-1 rounded-full border bg-[#f87171]/10 border-error-text/30 text-error-text">
                <Archive className="w-3 h-3" aria-hidden="true" /> Đã nghỉ
              </span>
            )}
          </div>
          <AttendanceSummary customerId={customer.id} />

          {/* Actions */}
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              data-testid="customer-detail-edit"
              onClick={() => setEditing(true)}
              aria-label={`Chỉnh sửa ${customer.id}`}
              className="tap-target flex items-center gap-1.5 px-4 py-2 rounded-full text-sm text-white/80 bg-white/5 active:bg-white/10 border border-white/10 transition-colors"
            >
              <Pencil className="w-4 h-4" aria-hidden="true" /> Sửa
            </button>
            <button
              type="button"
              data-testid={archived ? 'customer-detail-restore' : 'customer-detail-archive'}
              disabled={statusBusy}
              onClick={() => (archived ? void setActive(true) : setConfirmArchive(true))}
              aria-label={archived ? `Khôi phục ${customer.id}` : `Đánh dấu ${customer.id} đã nghỉ`}
              className={cn(
                'tap-target flex items-center gap-1.5 px-4 py-2 rounded-full text-sm border transition-colors disabled:opacity-60',
                archived
                  ? 'text-primary-text bg-[#0F6B3E]/10 border-[#0F6B3E]/30 active:bg-[#0F6B3E]/20'
                  : 'text-white/80 bg-white/5 border-white/10 active:bg-[#f87171]/10',
              )}
            >
              {statusBusy && archived ? (
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              ) : (
                <Archive className="w-4 h-4" aria-hidden="true" />
              )}
              {archived ? 'Khôi phục' : 'Đã nghỉ'}
            </button>
          </div>
        </div>

        {/* Basic info fields */}
        <div className="px-4 py-4 border-b border-white/8">
          {customer.age != null && (
            <DetailFieldMobile icon={<User className="w-4 h-4" />} label="Tuổi" value={`${customer.age} tuổi`} />
          )}
          {customer.address && (
            <DetailFieldMobile icon={<MapPin className="w-4 h-4" />} label="Địa chỉ" value={customer.address} />
          )}
          {(customer.height || customer.weight) && (
            <DetailFieldMobile
              icon={<Weight className="w-4 h-4" />}
              label="Số đo đăng ký"
              value={[customer.height && `${customer.height} cm`, customer.weight && `${customer.weight} kg`]
                .filter(Boolean)
                .join('  ·  ')}
            />
          )}
          {customer.health_note && (
            <DetailFieldMobile icon={<Activity className="w-4 h-4" />} label="Tình trạng sức khỏe" value={customer.health_note} />
          )}
          {!customer.age && !customer.address && !customer.height && !customer.weight && !customer.health_note && (
            <p className="text-white/60 text-sm text-center py-4">Hội viên chưa cập nhật thông tin.</p>
          )}
        </div>

        {/* Trainer Notes */}
        <TrainerNotes customerId={customer.id} />

        {/* InBody charts */}
        <InbodySectionMobile customerId={customer.id} />
      </div>

      {/* Edit sheet (MemberFormModal picks Sheet on mobile) */}
      {editing && (
        <MemberFormModal
          mode="edit"
          customer={customer}
          onClose={() => setEditing(false)}
          onSaved={() => { setEditing(false); reload(); }}
          showToast={show}
        />
      )}

      <ConfirmDialog
        open={confirmArchive}
        title={`Đánh dấu ${customer.id} đã nghỉ?`}
        body="Hội viên sẽ được ẩn khỏi danh sách mặc định. Lịch sử vẫn được giữ lại."
        confirmLabel="Đánh dấu đã nghỉ"
        tone="danger"
        busy={statusBusy}
        onConfirm={() => void setActive(false)}
        onCancel={() => setConfirmArchive(false)}
      />
      {toastNode}
    </div>
  );
}
