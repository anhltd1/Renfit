/**
 * Desktop admin customer detail panel (U5 Trainer Desktop, DL-1/EXT-1).
 * No `onBack` prop — that was mobile-only in the combined component; on
 * desktop both panes (sidebar + detail) are always visible.
 */
import { Activity, MapPin, Phone, User, Weight } from 'lucide-react';
import type { CustomerSummary } from '../../../lib/api/admin';
import { DetailField } from './DetailField';
import { InbodySection } from './InbodySection';

export interface CustomerDetailProps {
  customer: CustomerSummary;
}

export function CustomerDetail({ customer }: CustomerDetailProps) {
  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Hero */}
      <div className="flex flex-col items-center gap-3 py-8 px-6 border-b border-white/8">
        {customer.avatar ? (
          <img
            src={customer.avatar}
            alt={customer.id}
            className="w-24 h-24 rounded-full object-cover border-2 border-[#0F6B3E]/40"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-[#0F6B3E]/15 border-2 border-[#0F6B3E]/30 flex items-center justify-center">
            <User className="w-10 h-10 text-[#0F6B3E]" />
          </div>
        )}
        <div className="text-center">
          <h2 className="text-xl font-bold text-white">{customer.id}</h2>
          <p className="text-white/40 text-sm flex items-center justify-center gap-1.5 mt-1">
            <Phone className="w-3.5 h-3.5" />
            {customer.phone_number}
          </p>
          {customer.goal && (
            <span className="inline-block mt-2 bg-[#0F6B3E]/15 text-[#0F6B3E] text-xs px-3 py-1 rounded-full border border-[#0F6B3E]/25">
              {customer.goal}
            </span>
          )}
        </div>
      </div>

      {/* Basic info fields */}
      <div className="px-6 py-4 border-b border-white/8">
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

      {/* InBody charts */}
      <InbodySection customerId={customer.id} />
    </div>
  );
}
