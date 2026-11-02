/**
 * Mobile assign-booking sheet (U24, FR-5): pick a member (search by name or
 * phone, diacritic-insensitive) and book them into one slot.
 */
import { useState } from 'react';
import { CalendarCheck, Check, Clock, Search, UserRound } from 'lucide-react';
import { Sheet } from '../../shared/primitives/Sheet';
import { Button } from '../../shared/primitives/Button';
import { cn } from '../../shared/primitives/cn';
import { matchesQuery } from '../../shared/text/normalizeVi';
import { useCustomers } from '../../shared/hooks/useAdminBookings';
import { isActiveClient } from '../../shared/clients/clientFilters';
import type { ToastInput } from '../../shared/hooks/useToast';
import { assignBooking } from '../../../lib/api/admin';
import { fmtDayMonth, weekdayOf } from './AdminDayScroller';

const VIET_DAYS_FULL = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];

export interface AssignBookingSheetProps {
  open: boolean;
  /** Slot wall-clock time, "YYYY-MM-DDTHH:00" (ICT). */
  time: string;
  hour: number;
  date: string;
  onClose: () => void;
  onAssigned: () => void;
  showToast: (t: ToastInput) => void;
}

export function AssignBookingSheet({ open, time, hour, date, onClose, onAssigned, showToast }: AssignBookingSheetProps) {
  const { data: customers, loading } = useCustomers();
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [busy, setBusy] = useState(false);

  const list = (customers ?? []).filter(isActiveClient).filter((c) => matchesQuery([c.id, c.phone_number], search));
  const pad = (n: number) => String(n).padStart(2, '0');

  const submit = async () => {
    if (!selectedId || busy) return;
    setBusy(true);
    try {
      await assignBooking(selectedId, time);
      showToast({ kind: 'ok', text: `Đã đặt lịch tập cho ${selectedId}.` });
      onAssigned();
    } catch (err) {
      showToast({ kind: 'err', text: err instanceof Error && err.message ? err.message : 'Đặt lịch thất bại.' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Sheet open={open} onClose={() => !busy && onClose()} title="Đặt lịch tập cho hội viên" ops>
      <div className="flex flex-col gap-4" data-testid="assign-booking-sheet">
        <div className="rounded-2xl border border-[#0F6B3E]/25 bg-[#0F6B3E]/10 p-4 flex items-center gap-3">
          <CalendarCheck className="w-5 h-5 text-primary-text shrink-0" aria-hidden="true" />
          <div className="leading-relaxed">
            <p className="text-white font-semibold text-sm">
              {VIET_DAYS_FULL[weekdayOf(date)]} · {fmtDayMonth(date)}
            </p>
            <p className="text-white/70 text-sm flex items-center gap-1.5 tabular-nums">
              <Clock className="w-3.5 h-3.5" aria-hidden="true" />
              {pad(hour)}:00 – {pad(hour + 1)}:00
            </p>
          </div>
        </div>

        <div>
          <label htmlFor="assign-sheet-search" className="block text-white/70 text-sm font-semibold mb-2">
            Chọn hội viên
          </label>
          <div className="relative mb-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" aria-hidden="true" />
            <input
              id="assign-sheet-search"
              data-testid="input-assign-search"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên hoặc số điện thoại..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl pl-9 pr-3 py-3 text-base text-white placeholder:text-white/40 outline-none focus:border-[#3DBE7A] transition-colors"
            />
          </div>
          <div className="max-h-[40vh] overflow-y-auto flex flex-col gap-1" role="listbox" aria-label="Hội viên">
            {loading && !customers ? (
              <p className="text-white/60 text-sm text-center py-3">Đang tải...</p>
            ) : list.length === 0 ? (
              <p className="text-white/60 text-sm text-center py-3">Không tìm thấy hội viên</p>
            ) : (
              list.map((c) => {
                const picked = selectedId === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    role="option"
                    aria-selected={picked}
                    data-testid={`assign-option-${c.id}`}
                    onClick={() => setSelectedId(c.id)}
                    className={cn(
                      'w-full min-h-11 flex items-center gap-3 px-3 py-2 rounded-xl border text-sm text-left transition-colors',
                      picked ? 'bg-[#0F6B3E]/20 border-primary-text/50 text-white' : 'bg-white/[0.04] border-white/10 text-white/80',
                    )}
                  >
                    <UserRound className="w-4 h-4 shrink-0 text-white/60" aria-hidden="true" />
                    <span className="truncate font-medium flex-1">{c.id}</span>
                    <span className="text-xs text-white/60 tabular-nums">{c.phone_number}</span>
                    {picked && <Check className="w-4 h-4 shrink-0 text-primary-text" aria-hidden="true" />}
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={onClose} disabled={busy}>
            Huỷ
          </Button>
          <Button className="flex-1" data-testid="assign-submit" onClick={() => void submit()} disabled={!selectedId || busy}>
            {busy ? 'Đang xử lý...' : 'Đặt lịch tập'}
          </Button>
        </div>
      </div>
    </Sheet>
  );
}
