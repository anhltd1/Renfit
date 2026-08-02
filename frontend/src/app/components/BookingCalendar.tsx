/**
 * Shared booking calendar — 5-day sliding window.
 * Used by both the customer dashboard tab and the standalone /booking page.
 */
import React, { useEffect, useRef, useState } from 'react';
import {
  CalendarCheck,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
  RefreshCw,
  X,
} from 'lucide-react';
import type { Availability, Slot, DayAvailability } from '../../lib/api/bookings';
import { useFocusTrap } from '../shared/primitives/useFocusTrap';

/** U8 Accessibility — see AdminBookings.tsx's identical helper for rationale. */
function useEscapeToClose(open: boolean, onClose: () => void) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
}

const WINDOW = 5;
const VIET_DAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const VIET_DAYS_FULL = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];

function fmtDayLabel(iso: string): string {
  const [, m, d] = iso.split('-');
  return `${d}/${m}`;
}

interface BookingCalendarProps {
  customerId: string;
  data: Availability | null;
  loading: boolean;
  error: string;
  onBook: (slot: Slot) => Promise<void>;
  onCancel: (slot: Slot) => Promise<void>;
  onRefresh: () => void;
}

interface Pending {
  mode: 'book' | 'cancel';
  dateIso: string;
  weekLabel: string;
  slot: Slot;
}

type RenderDay =
  | { kind: 'sunday'; date: string }
  | { kind: 'working'; day: DayAvailability };

function withSundays(days: DayAvailability[]): RenderDay[] {
  const result: RenderDay[] = [];
  for (let i = 0; i < days.length; i++) {
    if (i > 0) {
      const prev = new Date(days[i - 1].date);
      const curr = new Date(days[i].date);
      const diff = Math.round((curr.getTime() - prev.getTime()) / 86400000);
      if (diff === 2 && prev.getDay() === 6) {
        const sun = new Date(prev);
        sun.setDate(sun.getDate() + 1);
        result.push({ kind: 'sunday', date: sun.toISOString().slice(0, 10) });
      }
    }
    result.push({ kind: 'working', day: days[i] });
  }
  return result;
}

export function BookingCalendar({
  data,
  loading,
  error,
  onBook,
  onCancel,
  onRefresh,
}: BookingCalendarProps) {
  const todayIso = new Date().toISOString().slice(0, 10);
  const [offset, setOffset] = useState(0);
  const [slideDir, setSlideDir] = useState<'left' | 'right' | null>(null);
  const [slideKey, setSlideKey] = useState(0);
  const [pending, setPending] = useState<Pending | null>(null);
  const [acting, setActing] = useState(false);
  const [toast, setToast] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  // Ref for scroll-into-view on first load
  const calendarRef = useRef<HTMLDivElement>(null);
  const didAutoScroll = useRef(false);
  const confirmDialogRef = useRef<HTMLDivElement>(null);

  // Snap to today's index when data arrives, then scroll into view.
  // If today is Sunday (not in the window), jump to the nearest future day instead.
  // Guard with didAutoScroll so silent background refreshes don't reset the user's position.
  useEffect(() => {
    if (!data || didAutoScroll.current) return;
    didAutoScroll.current = true;
    const idx = data.days.findIndex((d) => d.date === todayIso);
    if (idx >= 0) {
      setOffset(idx);
    } else {
      const todayDate = new Date(todayIso);
      const futureIdx = data.days.findIndex((d) => new Date(d.date) > todayDate);
      setOffset(futureIdx >= 0 ? futureIdx : Math.max(0, data.days.length - WINDOW));
    }
    setTimeout(() => {
      calendarRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }, [data, todayIso]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  useEscapeToClose(!!pending, () => setPending(null));
  useFocusTrap(!!pending, confirmDialogRef);

  const visibleDays = data?.days.slice(offset, offset + WINDOW) ?? [];
  const renderDays = withSundays(visibleDays);
  const hours = data?.days[0]?.slots.map((s) => s.hour) ?? [];
  const canLeft = offset > 0;
  const canRight = data ? offset + WINDOW < data.days.length : false;

  const confirmAction = async () => {
    if (!pending) return;
    setActing(true);
    try {
      if (pending.mode === 'book') {
        await onBook(pending.slot);
        setToast({ kind: 'ok', text: 'Đặt lịch thành công! Chờ HLV xác nhận.' });
      } else {
        await onCancel(pending.slot);
        setToast({ kind: 'ok', text: 'Đã hủy lịch đặt.' });
      }
      setPending(null);
    } catch (err) {
      setToast({ kind: 'err', text: err instanceof Error ? err.message : 'Thao tác thất bại.' });
    } finally {
      setActing(false);
    }
  };

  return (
    <div ref={calendarRef} className="flex flex-col gap-4 flex-1 min-h-0 scroll-mt-4">
      {/* Legend + navigation row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-white/70">
          <LegendDot cls="bg-white/5 border border-white/15" label="Còn trống" />
          <LegendDot cls="bg-white/15 border border-white/40" label="Chờ duyệt" />
          <LegendDot cls="bg-[#0F6B3E]/30 border border-[#0F6B3E]" label="Đã duyệt" />
          <LegendDot cls="bg-red-500/20 border border-red-500/50" label="Từ chối" />
          <LegendDot cls="bg-white/[0.03] border border-white/8" label="Đầy / đã qua" />
        </div>
        {/* Navigation */}
        <div className="flex items-center gap-2">
          <button type="button" onClick={onRefresh} title="Làm mới" aria-label="Làm mới"
            className="p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/5 transition-all">
            <RefreshCw className={`w-4 h-4 ${loading && !data ? 'animate-spin' : ''}`} />
          </button>
          <button type="button" disabled={!canLeft} onClick={() => { setSlideDir('right'); setSlideKey((k) => k + 1); setOffset((o) => o - 1); }}
            aria-label="Xem ngày trước"
            className="p-2 rounded-xl border border-white/15 text-white/60 hover:text-white hover:border-[#0F6B3E]/60 disabled:opacity-25 disabled:cursor-not-allowed transition-all">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-white/50 text-sm min-w-[100px] text-center font-medium">
            {visibleDays[0] && visibleDays[visibleDays.length - 1]
              ? `${fmtDayLabel(visibleDays[0].date)} → ${fmtDayLabel(visibleDays[visibleDays.length - 1].date)}`
              : '—'}
          </span>
          <button type="button" disabled={!canRight} onClick={() => { setSlideDir('left'); setSlideKey((k) => k + 1); setOffset((o) => o + 1); }}
            aria-label="Xem ngày sau"
            className="p-2 rounded-xl border border-white/15 text-white/60 hover:text-white hover:border-[#0F6B3E]/60 disabled:opacity-25 disabled:cursor-not-allowed transition-all">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Calendar grid */}
      {loading && !data ? (
        <div className="flex flex-col items-center justify-center py-24 text-white/40 gap-3">
          <Loader2 className="w-7 h-7 animate-spin" />
          <p className="text-base">Đang tải lịch...</p>
        </div>
      ) : error ? (
        <div className="bg-red-400/10 border border-red-400/25 text-red-300 rounded-2xl px-5 py-4 text-base">{error}</div>
      ) : data ? (
        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#0D0D0D] pb-1">
          <div
            key={slideKey}
            className={slideDir === 'left' ? 'animate-slide-in-left' : slideDir === 'right' ? 'animate-slide-in-right' : ''}
            style={{ minWidth: `${72 + renderDays.length * 160}px` }}
          >
            {/* Day header row */}
            <div className="grid" style={{ gridTemplateColumns: `72px repeat(${renderDays.length}, 1fr)` }}>
              <div className="bg-[#0A0A0A] border-b border-r border-white/10 p-3 flex items-center justify-center">
                <Clock className="w-4 h-4 text-white/30" />
              </div>
              {renderDays.map((entry) => {
                if (entry.kind === 'sunday') {
                  return (
                    <div key={entry.date} className="border-b border-white/10 p-3 text-center bg-[#0A0A0A] relative overflow-hidden">
                      <div className="absolute inset-0 opacity-[0.07]" style={{ background: 'repeating-linear-gradient(-45deg, #fff 0px, #fff 1px, transparent 1px, transparent 8px)' }} />
                      <p className="font-bold text-base leading-tight text-red-400/50">CN</p>
                      <p className="text-sm mt-0.5 font-medium text-white/25">{fmtDayLabel(entry.date)}</p>
                      <span className="inline-block mt-1 text-[11px] bg-red-500/10 text-red-400/60 px-2 py-0.5 rounded-full font-semibold border border-red-500/15">
                        Nghỉ
                      </span>
                    </div>
                  );
                }
                const day = entry.day;
                const isToday = day.date === todayIso;
                const dowIdx = new Date(day.date).getDay();
                return (
                  <div key={day.date}
                    className={`border-b border-white/10 p-3 text-center transition-colors ${
                      isToday ? 'bg-[#0F6B3E] border-b-[#0F6B3E]' : 'bg-[#0A0A0A]'
                    }`}>
                    <p className={`font-bold text-base leading-tight ${isToday ? 'text-white' : 'text-white/90'}`}>
                      {VIET_DAYS[dowIdx]}
                    </p>
                    <p className={`text-sm mt-0.5 font-medium ${isToday ? 'text-white/80' : 'text-white/50'}`}>
                      {fmtDayLabel(day.date)}
                    </p>
                    {isToday && (
                      <span className="inline-block mt-1 text-[11px] bg-white/20 text-white px-2 py-0.5 rounded-full font-semibold">
                        Hôm nay
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Hour rows */}
            {hours.map((hour, rowIdx) => (
              <div key={hour} className="grid" style={{ gridTemplateColumns: `72px repeat(${renderDays.length}, 1fr)` }}>
                {/* Hour label */}
                <div className={`border-r border-white/10 px-3 py-0 flex items-center justify-center text-sm font-semibold text-white/70 ${rowIdx % 2 === 0 ? 'bg-white/[0.02]' : ''}`}>
                  {String(hour).padStart(2, '0')}:00
                </div>
                {/* Slot cells */}
                {renderDays.map((entry) => {
                  if (entry.kind === 'sunday') {
                    return (
                      <div key={entry.date + hour}
                        className={`h-[72px] border-b border-r border-white/8 relative overflow-hidden ${rowIdx % 2 === 0 ? 'bg-white/[0.01]' : ''}`}>
                        <div className="absolute inset-0" style={{ background: 'repeating-linear-gradient(-45deg, transparent 0px, transparent 6px, rgba(255,255,255,0.03) 6px, rgba(255,255,255,0.03) 7px)' }} />
                      </div>
                    );
                  }
                  const day = entry.day;
                  const slot = day.slots[rowIdx];
                  const isToday = day.date === todayIso;
                  return (
                    <SlotCell key={day.date + hour}
                      slot={slot} capacity={data.capacity}
                      striped={rowIdx % 2 === 0} isToday={isToday}
                      onBook={() => setPending({ mode: 'book', dateIso: day.date, weekLabel: day.label, slot })}
                      onCancel={() => setPending({ mode: 'cancel', dateIso: day.date, weekLabel: day.label, slot })}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Confirm modal */}
      {pending && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && setPending(null)}>
          <div ref={confirmDialogRef} role="dialog" aria-modal="true"
            aria-label={pending.mode === 'book' ? 'Xác nhận đặt lịch' : 'Hủy lịch đặt'} tabIndex={-1}
            className="bg-[#111] border border-white/12 rounded-2xl w-full max-w-sm shadow-2xl p-6">
            <div className="flex items-start justify-between mb-5">
              <h3 className="text-white font-bold text-xl">
                {pending.mode === 'book' ? 'Xác nhận đặt lịch' : 'Hủy lịch đặt'}
              </h3>
              <button type="button" onClick={() => setPending(null)} aria-label="Đóng" className="text-white/40 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="bg-[#0F6B3E]/10 border border-[#0F6B3E]/25 rounded-xl p-4 mb-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#0F6B3E]/25 flex items-center justify-center shrink-0">
                <CalendarCheck className="w-6 h-6 text-[#0F6B3E]" />
              </div>
              <div>
                <p className="text-white font-semibold text-base">
                  {VIET_DAYS_FULL[new Date(pending.dateIso).getDay()]} · {fmtDayLabel(pending.dateIso)}
                </p>
                <p className="text-white/60 text-sm mt-0.5 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  {String(pending.slot.hour).padStart(2, '0')}:00 – {String(pending.slot.hour + 1).padStart(2, '0')}:00
                </p>
              </div>
            </div>
            <p className="text-white/60 text-sm mb-6 leading-relaxed">
              {pending.mode === 'book'
                ? 'Sau khi đặt, lịch sẽ ở trạng thái "Chờ duyệt" cho đến khi huấn luyện viên xác nhận.'
                : 'Bạn có chắc muốn hủy? Khung giờ sẽ được mở lại cho người khác.'}
            </p>
            <div className="flex gap-3">
              <button type="button" onClick={() => setPending(null)}
                className="flex-1 bg-white/5 hover:bg-white/10 border border-white/12 text-white/70 hover:text-white py-3 rounded-xl text-base transition-all">
                Quay lại
              </button>
              <button type="button" onClick={confirmAction} disabled={acting}
                className={`flex-1 py-3 rounded-xl text-base font-semibold text-white disabled:opacity-60 transition-all ${
                  pending.mode === 'book'
                    ? 'bg-[#0F6B3E] hover:bg-[#0F6B3E]/90 hover:shadow-[0_0_20px_rgba(15,107,62,0.4)]'
                    : 'bg-red-500 hover:bg-red-400'
                }`}>
                {acting ? 'Đang xử lý...' : pending.mode === 'book' ? 'Đặt lịch' : 'Hủy lịch'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 w-full max-w-sm flex justify-center">
          <div className={`w-full px-6 py-3.5 rounded-xl border shadow-2xl flex items-center gap-2.5 text-base font-medium ${
            toast.kind === 'ok' ? 'bg-[#0F6B3E] border-[#0F6B3E]/60 text-white' : 'bg-red-500 border-red-500/60 text-white'
          }`}>
            {toast.kind === 'ok' ? <Check className="w-5 h-5 shrink-0" /> : <X className="w-5 h-5 shrink-0" />}
            {toast.text}
          </div>
        </div>
      )}
    </div>
  );
}

function LegendDot({ cls, label }: { cls: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`w-4 h-4 rounded-md shrink-0 ${cls}`} />
      <span>{label}</span>
    </div>
  );
}

const SlotCell = React.memo(function SlotCell({
  slot, capacity, striped, isToday, onBook, onCancel,
}: {
  slot: Slot; capacity: number; striped: boolean; isToday: boolean;
  onBook: () => void; onCancel: () => void;
}) {
  // Today column gets a stronger left border highlight
  const todayColCls = isToday
    ? 'border-l-2 border-l-[#0F6B3E]/50 bg-[#0F6B3E]/[0.06]'
    : '';
  const base = `min-h-[72px] border-b border-r border-white/8 flex flex-col items-center justify-center gap-1 px-1.5 py-1.5 transition-all ${
    striped && !isToday ? 'bg-white/[0.02]' : ''
  } ${todayColCls}`;

  // My booking: pending or approved
  if (slot.my_status === 'pending' || slot.my_status === 'approved') {
    const approved = slot.my_status === 'approved';
    return (
      <button type="button" onClick={onCancel} title="Nhấn để hủy"
        className={`${base} group cursor-pointer ${
          approved
            ? 'bg-[#0F6B3E]/20 hover:bg-[#0F6B3E]/30'
            : 'bg-white/8 hover:bg-white/12'
        }`}>
        <span className={`text-sm font-bold leading-tight ${approved ? 'text-[#0F6B3E]' : 'text-white/90'}`}>
          {approved ? '✓ Đã duyệt' : '⏳ Chờ duyệt'}
        </span>
        <span className="text-xs text-red-400/70 opacity-0 group-hover:opacity-100 transition-opacity font-medium">
          Nhấn để hủy
        </span>
      </button>
    );
  }

  // Past slot
  if (slot.past) {
    return (
      <div className={`${base} text-white/20 text-sm`}>—</div>
    );
  }

  // Full slot
  if (slot.full) {
    return (
      <div className={`${base} bg-white/[0.025]`}>
        <span className="text-white/35 text-sm font-medium">Đã đầy</span>
        <span className="text-white/20 text-xs">0 / {capacity}</span>
      </div>
    );
  }

  // Available (or previously rejected → can re-book)
  const remaining = capacity - slot.count;
  return (
    <button type="button" onClick={onBook}
      className={`${base} hover:bg-[#0F6B3E]/12 group cursor-pointer`}>
      {slot.my_status === 'rejected' ? (
        <span className="text-red-400 text-sm font-semibold">Bị từ chối</span>
      ) : (
        <span className="text-white/65 text-sm font-medium">
          Còn {remaining} chỗ
        </span>
      )}
      {/* Always-visible "Đặt lịch" button */}
      <span className="inline-flex items-center gap-1 bg-[#0F6B3E]/25 group-hover:bg-[#0F6B3E]/50 border border-[#0F6B3E]/40 group-hover:border-[#0F6B3E]/70 text-[#0F6B3E] text-xs font-semibold px-3 py-0.5 rounded-lg transition-all">
        + Đặt lịch
      </span>
    </button>
  );
});
