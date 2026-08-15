/**
 * BatchBookingMode — overlay UI for batch pre-booking (U13).
 * Shows member picker when no member selected, then a bottom bar with
 * staged slot count and confirm/cancel actions.
 */
import { useState } from 'react';
import { AlertTriangle, Check, Loader2, Search, UserRound, X } from 'lucide-react';
import type { AdminBookings, CustomerSummary } from '../../lib/api/admin';
import { haptic } from '../shared/primitives/haptics';

interface BatchBookingModeProps {
  member: CustomerSummary | null;
  onSelectMember: (c: CustomerSummary) => void;
  stagedSlots: Set<string>;
  submitting: boolean;
  onSubmit: () => void;
  onCancel: () => void;
  customers: CustomerSummary[];
  data: AdminBookings | null;
}

export function BatchBookingMode({
  member,
  onSelectMember,
  stagedSlots,
  submitting,
  onSubmit,
  onCancel,
  customers,
  data,
}: BatchBookingModeProps) {
  const [search, setSearch] = useState('');

  // Count how many staged slots are full (at capacity)
  const fullSlotCount = (() => {
    if (!data) return 0;
    let count = 0;
    for (const day of data.days) {
      for (const slot of day.slots) {
        if (stagedSlots.has(slot.time) && slot.bookings.length >= data.capacity) {
          count++;
        }
      }
    }
    return count;
  })();

  // Member picker (shown when no member selected)
  if (!member) {
    const filtered = customers.filter(
      (c) => !search || c.id.toLowerCase().includes(search.toLowerCase()),
    );

    return (
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#111] border-t border-white/12 shadow-2xl rounded-t-2xl p-4 max-h-[50vh] flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h4 className="text-white font-bold text-sm">Chọn hội viên để đặt lịch loạt</h4>
          <button type="button" onClick={onCancel} className="text-white/40 hover:text-white transition-colors" aria-label="Huỷ">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            placeholder="Tìm theo tên..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-[#0F6B3E]/60 transition-colors"
          />
        </div>
        <div className="flex-1 overflow-y-auto space-y-1">
          {filtered.length === 0 ? (
            <p className="text-white/30 text-sm text-center py-4">Không tìm thấy</p>
          ) : (
            filtered.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => { haptic(); onSelectMember(c); }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl border border-white/8 bg-white/[0.03] hover:border-[#0F6B3E]/30 hover:bg-[#0F6B3E]/5 text-left transition-all"
              >
                <UserRound className="w-4 h-4 text-white/40 shrink-0" />
                <span className="text-white/80 text-sm font-medium truncate">{c.id}</span>
              </button>
            ))
          )}
        </div>
      </div>
    );
  }

  // Bottom bar (shown when member selected, displaying staged count)
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#111] border-t border-[#0F6B3E]/30 shadow-2xl px-4 py-3 flex items-center gap-3">
      <div className="flex-1 min-w-0">
        <p className="text-white font-semibold text-sm truncate">
          {member.id}
        </p>
        <p className="text-white/50 text-xs mt-0.5">
          {stagedSlots.size > 0
            ? `${stagedSlots.size} buổi đã chọn`
            : 'Nhấn vào khung giờ trống để chọn'}
        </p>
      </div>

      {fullSlotCount > 0 && (
        <div className="flex items-center gap-1 text-amber-400 text-xs shrink-0">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>{fullSlotCount} slot đầy</span>
        </div>
      )}

      <button
        type="button"
        onClick={onCancel}
        className="px-3 py-2 rounded-xl bg-white/5 border border-white/12 text-white/60 hover:text-white text-sm transition-all"
      >
        Huỷ
      </button>
      <button
        type="button"
        onClick={() => { haptic(); onSubmit(); }}
        disabled={stagedSlots.size === 0 || submitting}
        className="px-4 py-2 rounded-xl bg-[#0F6B3E] text-white text-sm font-semibold hover:bg-[#0F6B3E]/80 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
      >
        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 inline mr-1" />}
        {submitting ? '' : 'Xác nhận'}
      </button>
    </div>
  );
}
