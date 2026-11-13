/**
 * Shared booking calendar — 5-day sliding window.
 * Used by both the customer dashboard tab and the standalone /booking page.
 */
import React, { useEffect, useRef, useState } from 'react';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RefreshCw,
  X,
} from 'lucide-react';
import type { Availability, Slot, DayAvailability } from '../../lib/api/bookings';
import { useFocusTrap } from '../shared/primitives/useFocusTrap';
import { haptic } from '../shared/primitives/haptics';
import { CapacityMarks } from '../shared/booking/CapacityMarks';
import { StatusBadge } from '../shared/booking/StatusBadge';

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
    haptic();
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
        {/* Legend — each swatch is the mark it explains */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/64">
          <span className="inline-flex items-center gap-2"><CapacityMarks taken={2} /> Mỗi giờ 4 chỗ: đã đặt / còn trống</span>
          <span className="inline-flex items-center gap-2"><CapacityMarks taken={1} capacity={1} mine /> Chỗ của bạn</span>
        </div>
        {/* Navigation */}
        <div className="flex items-center gap-2">
          <button type="button" onClick={onRefresh} title="Làm mới" aria-label="Làm mới"
            className="p-2 rounded-control text-white/64 hover:text-white hover:bg-surface-2 transition-colors">
            <RefreshCw className={`w-4 h-4 ${loading && !data ? 'animate-spin' : ''}`} />
          </button>
          <button type="button" disabled={!canLeft} onClick={() => { setSlideDir('right'); setSlideKey((k) => k + 1); setOffset((o) => o - 1); }}
            aria-label="Xem ngày trước"
            className="p-2 rounded-control border border-line-strong text-white/64 hover:text-white hover:bg-surface-2 disabled:opacity-25 disabled:cursor-not-allowed transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-white/80 text-sm min-w-[110px] text-center font-medium tabular-nums">
            {visibleDays[0] && visibleDays[visibleDays.length - 1]
              ? `${fmtDayLabel(visibleDays[0].date)} → ${fmtDayLabel(visibleDays[visibleDays.length - 1].date)}`
              : '—'}
          </span>
          <button type="button" disabled={!canRight} onClick={() => { setSlideDir('left'); setSlideKey((k) => k + 1); setOffset((o) => o + 1); }}
            aria-label="Xem ngày sau"
            className="p-2 rounded-control border border-line-strong text-white/64 hover:text-white hover:bg-surface-2 disabled:opacity-25 disabled:cursor-not-allowed transition-colors">
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
        <div className="border border-error-text/30 bg-[#f87171]/[0.06] text-error-text rounded-panel px-5 py-4 text-sm">{error}</div>
      ) : data ? (
        <div className="overflow-x-auto rounded-panel border border-line bg-surface">
          <div
            key={slideKey}
            className={slideDir === 'left' ? 'animate-slide-in-left' : slideDir === 'right' ? 'animate-slide-in-right' : ''}
            style={{ minWidth: `${72 + renderDays.length * 160}px` }}
          >
            {/* Day header row */}
            <div className="grid" style={{ gridTemplateColumns: `72px repeat(${renderDays.length}, 1fr)` }}>
              <div className="border-b border-r border-line p-3" aria-hidden="true" />
              {renderDays.map((entry) => {
                if (entry.kind === 'sunday') {
                  return (
                    <div key={entry.date} className="border-b border-line p-3 text-center">
                      <p className="font-semibold text-sm leading-tight text-white/64">CN</p>
                      <p className="text-xs mt-0.5 text-white/64 tabular-nums">{fmtDayLabel(entry.date)}</p>
                      <p className="text-xs mt-1 text-white/64">Nghỉ</p>
                    </div>
                  );
                }
                const day = entry.day;
                const isToday = day.date === todayIso;
                const dowIdx = new Date(day.date).getDay();
                return (
                  <div key={day.date}
                    aria-current={isToday ? 'date' : undefined}
                    className={`border-b p-3 text-center ${isToday ? 'border-b-primary-text border-b-2' : 'border-line'}`}>
                    <p className="font-semibold text-sm leading-tight text-white">
                      {VIET_DAYS[dowIdx]}
                    </p>
                    <p className="text-xs mt-0.5 text-white/64 tabular-nums">
                      {fmtDayLabel(day.date)}
                    </p>
                    {isToday && <p className="text-xs mt-1 text-primary-text font-medium">Hôm nay</p>}
                  </div>
                );
              })}
            </div>

            {/* Hour rows */}
            {hours.map((hour, rowIdx) => (
              <div key={hour} className="grid" style={{ gridTemplateColumns: `72px repeat(${renderDays.length}, 1fr)` }}>
                {/* Hour label */}
                <div className="border-r border-line px-3 py-0 flex items-start justify-end pt-2 text-xs font-medium text-white/64 tabular-nums">
                  {String(hour).padStart(2, '0')}:00
                </div>
                {/* Slot cells */}
                {renderDays.map((entry) => {
                  if (entry.kind === 'sunday') {
                    return (
                      <div key={entry.date + hour}
                        className="h-16 border-b border-r border-line relative overflow-hidden" aria-hidden="true">
                        {/* 1px hatch = closed day (Sunday) */}
                        <div className="absolute inset-0" style={{ background: 'repeating-linear-gradient(-45deg, transparent 0px, transparent 7px, rgba(255,255,255,0.05) 7px, rgba(255,255,255,0.05) 8px)' }} />
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
            className="bg-overlay border border-white/12 rounded-panel w-full max-w-sm shadow-2xl p-6">
            <div className="flex items-start justify-between mb-5">
              <h3 className="text-white font-semibold text-lg">
                {pending.mode === 'book' ? 'Xác nhận đặt lịch' : 'Hủy lịch đặt'}
              </h3>
              <button type="button" onClick={() => setPending(null)} aria-label="Đóng" className="text-white/40 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="border border-line rounded-control bg-surface-2 p-4 mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-white text-2xl font-semibold tabular-nums leading-tight">
                  {String(pending.slot.hour).padStart(2, '0')}:00 – {String(pending.slot.hour + 1).padStart(2, '0')}:00
                </p>
                <p className="text-white/64 text-sm mt-1">
                  {VIET_DAYS_FULL[new Date(pending.dateIso).getDay()]} · {fmtDayLabel(pending.dateIso)}
                </p>
              </div>
              <CapacityMarks
                taken={pending.mode === 'book' ? pending.slot.count : pending.slot.count}
                capacity={data?.capacity ?? 4}
                mine={pending.mode === 'cancel'}
                showLabel
                labelStyle="remaining"
              />
            </div>
            <p className="text-white/64 text-sm mb-6 leading-relaxed">
              {pending.mode === 'book'
                ? 'Sau khi đặt, lịch sẽ ở trạng thái "Chờ duyệt" cho đến khi huấn luyện viên xác nhận.'
                : 'Bạn có chắc muốn hủy? Khung giờ sẽ được mở lại cho người khác.'}
            </p>
            <div className="flex gap-3">
              <button type="button" onClick={() => setPending(null)}
                className="flex-1 bg-surface-2 hover:bg-surface-3 border border-line-strong text-white py-3 rounded-control text-sm font-medium transition-colors">
                Quay lại
              </button>
              <button type="button" onClick={confirmAction} disabled={acting}
                className={`flex-1 py-3 text-sm font-semibold disabled:opacity-60 transition-colors ${
                  pending.mode === 'book'
                    ? 'rounded-full bg-primary hover:bg-primary-hover text-white'
                    : 'rounded-control border border-error-text/35 text-error-text hover:bg-error-text/10'
                }`}>
                {acting ? 'Đang xử lý...' : pending.mode === 'book' ? 'Đặt lịch' : 'Hủy lịch'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 w-full max-w-sm flex justify-center animate-toast-in">
          <div role="status" className={`w-full px-4 py-3 rounded-control border bg-overlay text-white shadow-[0_16px_48px_rgba(0,0,0,0.5)] flex items-center gap-2.5 text-sm font-medium ${
            toast.kind === 'ok' ? 'border-line' : 'border-error-text/40'
          }`}>
            {toast.kind === 'ok' ? <Check className="w-5 h-5 shrink-0 text-primary-text" /> : <X className="w-5 h-5 shrink-0 text-error-text" />}
            {toast.text}
          </div>
        </div>
      )}
    </div>
  );
}

const SlotCell = React.memo(function SlotCell({
  slot, capacity, striped, isToday, onBook, onCancel,
}: {
  slot: Slot; capacity: number; striped: boolean; isToday: boolean;
  onBook: () => void; onCancel: () => void;
}) {
  const time = `${String(slot.hour).padStart(2, '0')}:00`;
  const base = `h-16 border-b border-r border-line flex flex-col items-center justify-center gap-1.5 px-1.5 transition-colors duration-[var(--motion-fast)] ${
    isToday ? 'bg-white/[0.025]' : ''
  }`;
  void striped;

  // My booking: pending or approved — tap to cancel.
  if (slot.my_status === 'pending' || slot.my_status === 'approved') {
    return (
      <button type="button" onClick={onCancel}
        aria-label={`Lịch của bạn lúc ${time}, ${slot.my_status === 'approved' ? 'đã duyệt' : 'chờ duyệt'}. Nhấn để hủy`}
        className={`${base} group cursor-pointer bg-primary-tint hover:bg-[#0F6B3E]/25`}>
        <StatusBadge status={slot.my_status} />
        <span className="flex items-center gap-1.5">
          <CapacityMarks taken={slot.count} capacity={capacity} mine />
          <span className="text-xs text-error-text opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity">Hủy</span>
        </span>
      </button>
    );
  }

  // My attended / missed session (U22) — read-only, cannot be cancelled.
  if (slot.my_status === 'completed' || slot.my_status === 'no_show') {
    return (
      <div className={base} data-testid={`slot-attendance-${slot.my_status}`}>
        <StatusBadge status={slot.my_status} />
      </div>
    );
  }

  // Past slot
  if (slot.past) {
    return <div className={`${base} text-white/40 text-sm`} aria-label={`${time} đã qua`}>—</div>;
  }

  // Full slot
  if (slot.full) {
    return (
      <div className={base} aria-label={`${time} hết chỗ`}>
        <CapacityMarks taken={capacity} capacity={capacity} />
        <span className="text-white/64 text-xs">Hết chỗ</span>
      </div>
    );
  }

  // Available (or previously rejected → can re-book)
  const remaining = capacity - slot.count;
  return (
    <button type="button" onClick={onBook}
      aria-label={`Đặt lịch lúc ${time}, còn ${remaining} chỗ`}
      className={`${base} group cursor-pointer hover:bg-surface-2`}>
      <CapacityMarks taken={slot.count} capacity={capacity} />
      {slot.my_status === 'rejected' ? (
        <span className="text-error-text text-xs font-medium">Bị từ chối · đặt lại</span>
      ) : (
        <span className="text-xs tabular-nums">
          <span className="text-white/80 group-hover:hidden">Còn {remaining} chỗ</span>
          <span className="text-primary-text font-semibold hidden group-hover:inline">+ Đặt lịch</span>
        </span>
      )}
    </button>
  );
});
