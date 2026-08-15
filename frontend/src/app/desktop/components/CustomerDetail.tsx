/**
 * Desktop admin customer detail panel (U5 Trainer Desktop, DL-1/EXT-1).
 * No `onBack` prop — that was mobile-only in the combined component; on
 * desktop both panes (sidebar + detail) are always visible.
 */
import { useState } from 'react';
import { Activity, Archive, MapPin, Pencil, Phone, User, Weight } from 'lucide-react';
import type { CustomerSummary } from '../../../lib/api/admin';
import { archiveMember } from '../../../lib/api/admin';
import { DetailField } from './DetailField';
import { InbodySection } from './InbodySection';
import { TrainerNotes } from '../../components/TrainerNotes';
import { MemberFormModal } from '../../components/MemberFormModal';

export interface CustomerDetailProps {
  customer: CustomerSummary;
  onRefresh?: () => void;
}

export function CustomerDetail({ customer, onRefresh }: CustomerDetailProps) {
  const [editing, setEditing] = useState(false);
  return (
    <div className="flex h-full overflow-hidden">
      {/* Left column: identity + info */}
      <div className="w-72 shrink-0 flex flex-col overflow-y-auto border-r border-white/6">
        {/* Hero */}
        <div className="flex flex-col items-center gap-2 py-5 px-4 border-b border-white/8">
          {customer.avatar ? (
            <img
              src={customer.avatar}
              alt={customer.id}
              className="w-16 h-16 rounded-full object-cover border-2 border-[#0F6B3E]/40"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-[#0F6B3E]/15 border-2 border-[#0F6B3E]/30 flex items-center justify-center">
              <User className="w-7 h-7 text-[#0F6B3E]" />
            </div>
          )}
          <div className="text-center">
            <h2 className="text-lg font-bold text-white">{customer.id}</h2>
            <p className="text-white/40 text-xs flex items-center justify-center gap-1.5 mt-0.5">
              <Phone className="w-3 h-3" />
              {customer.phone_number}
            </p>
            {customer.goal && (
              <span className="inline-block mt-2 bg-[#0F6B3E]/15 text-[#0F6B3E] text-xs px-3 py-1 rounded-full border border-[#0F6B3E]/25">
                {customer.goal}
              </span>
            )}
            {/* Edit + Status toggle */}
            <div className="flex items-center gap-2 mt-3">
              <button type="button" onClick={() => setEditing(true)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs text-white/50 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
                title="Chỉnh sửa">
                <Pencil className="w-3 h-3" /> Sửa
              </button>
              <button type="button" onClick={async () => {
                if (customer.active === false) {
                  const { restoreMember } = await import('../../../lib/api/admin');
                  await restoreMember(customer.id);
                } else {
                  await archiveMember(customer.id);
                }
                onRefresh?.();
              }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs border transition-all ${
                  customer.active === false
                    ? 'text-[#0F6B3E] bg-[#0F6B3E]/10 border-[#0F6B3E]/30 hover:bg-[#0F6B3E]/20'
                    : 'text-white/50 hover:text-red-400 bg-white/5 hover:bg-red-400/10 border-white/10 hover:border-red-400/30'
                }`}
                title={customer.active === false ? 'Khôi phục hội viên' : 'Đánh dấu đã nghỉ'}>
                <Archive className="w-3 h-3" />
                {customer.active === false ? 'Khôi phục' : 'Đã nghỉ'}
              </button>
            </div>
          </div>
        </div>

        {/* Basic info fields */}
        <div className="px-4 py-3">
          {customer.age != null && (
            <DetailField icon={<User className="w-4 h-4" />} label="Tuổi" value={`${customer.age} tuổi`} />
          )}
          {customer.address && (
            <DetailField icon={<MapPin className="w-4 h-4" />} label="Địa chỉ" value={customer.address} />
          )}
          {(customer.height || customer.weight) && (
            <DetailField
              icon={<Weight className="w-4 h-4" />}
              label="Số đo đăng ký"
              value={[customer.height && `${customer.height} cm`, customer.weight && `${customer.weight} kg`]
                .filter(Boolean)
                .join('  ·  ')}
            />
          )}
          {customer.health_note && (
            <DetailField icon={<Activity className="w-4 h-4" />} label="Tình trạng sức khỏe" value={customer.health_note} />
          )}
          {!customer.age && !customer.address && !customer.height && !customer.weight && !customer.health_note && (
            <p className="text-white/50 text-sm text-center py-4">Hội viên chưa cập nhật thông tin.</p>
          )}
        </div>
      </div>

      {/* Right column: notes + InBody */}
      <div className="flex-1 overflow-y-auto">
        <TrainerNotes customerId={customer.id} />
        <InbodySection customerId={customer.id} />
      </div>

      {/* Edit modal */}
      {editing && (
        <MemberFormModal
          mode="edit"
          customer={customer}
          onClose={() => setEditing(false)}
          onSaved={() => { setEditing(false); onRefresh?.(); }}
        />
      )}
    </div>
  );
}
