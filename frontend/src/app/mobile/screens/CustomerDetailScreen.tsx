/**
 * Trainer mobile customer detail screen (U6 Trainer Mobile, TR-2, DETAIL-1).
 * Pushed via the "clients" tab's useStack(); same content/order as the
 * desktop CustomerDetail (hero, detail rows, InBody section), but a
 * mobile-tree-only file per the shared/desktop/mobile import-isolation rule.
 */
import { Activity, MapPin, Phone, User, Weight } from 'lucide-react';
import type { CustomerSummary } from '../../../lib/api/admin';
import { StackHeader } from '../shell/StackHeader';
import { InbodySectionMobile } from '../components/InbodySectionMobile';
import { TrainerNotes } from '../../components/TrainerNotes';

export interface CustomerDetailScreenProps {
  customer: CustomerSummary;
  onBack: () => void;
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
        <span className="text-[#0F6B3E]">{icon}</span>
      </div>
      <div>
        <p className="text-white/35 text-[11px] uppercase tracking-widest mb-0.5">{label}</p>
        <p className="text-white/90 text-sm leading-relaxed">{value}</p>
      </div>
    </div>
  );
}

export function CustomerDetailScreen({ customer, onBack }: CustomerDetailScreenProps) {
  return (
    <div className="flex flex-col min-h-0 flex-1">
      <StackHeader title={customer.id} onBack={onBack} />
      <div className="flex-1 overflow-y-auto">
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
            <p className="text-white/50 text-sm text-center py-4">Hội viên chưa cập nhật thông tin.</p>
          )}
        </div>

        {/* Trainer Notes */}
        <TrainerNotes customerId={customer.id} />

        {/* InBody charts */}
        <InbodySectionMobile customerId={customer.id} />
      </div>
    </div>
  );
}
