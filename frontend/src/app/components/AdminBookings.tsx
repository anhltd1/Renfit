import { useCallback, useEffect, useRef, useState } from 'react';
import {
  CalendarCheck,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
  RefreshCw,
  RotateCcw,
  X,
} from 'lucide-react';
import {
  fetchBookings,
  updateBookingStatus,
  type AdminBookingItem,
  type AdminBookings as AdminBookingsData,
  type BookingStatus,
} from '../../lib/api/admin';

const WINDOW = 5;
const VIET_DAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const VIET_DAYS_FULL = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];

function fmtDayLabel(iso: string): string {
  const [, m, d] = iso.split('-');
  return `${d}/${m}`;
}

const STATUS_META: Record<BookingStatus, { label: string; pill: string }> = {
  pending: {
    label: 'Chờ duyệt',
    pill: 'bg-white/12 border-white/30 text-white hover:bg-white/18',
  },
  approved: {
    label: 'Đã duyệt',
    pill: 'bg-[#0F6B3E]/30 border-[#0F6B3E]/60 text-[#6ee7b7] hover:bg-[#0F6B3E]/40',
  },
  rejected: {
    label: 'Từ chối',
    pill: 'bg-red-500/20 border-red-500/50 text-red-300 hover:bg-red-500/30',
  },
};

interface Selected {
  booking: AdminBookingItem;
  dateIso: string;
  hour: number;
}

export function AdminBookings() {
  const todayIso = new Date().toISOString().slice(0, 10);

  const [data, setData] = useState<AdminBookingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [offset, setOffset] = useState(0);
  const [selected, setSelected] = useState<Selected | null>(null);
  const [acting, setActing] = useState(false);
  const [toast, setToast] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  const calendarRef = useRef<HTMLDivElement>(null);
  const didAutoScroll = useRef(false);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError('');
    try {
      setData(await fetchBookings());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không tải được lịch đặt.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Snap to today when data arrives + auto-scroll.
  // If today is Sunday (not in the window), jump to the nearest future day instead.
  useEffect(() => {
    if (!data) return;
    const idx = data.days.findIndex((d) => d.date === todayIso);
    if (idx >= 0) {
      setOffset(idx);
    } else {
      const todayDate = new Date(todayIso);
      const futureIdx = data.days.findIndex((d) => new Date(d.date) > todayDate);
      setOffset(futureIdx >= 0 ? futureIdx : Math.max(0, data.days.length - WINDOW));
    }
    if (!didAutoScroll.current) {
      didAutoScroll.current = true;
      setTimeout(() => {
        calendarRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [data, todayIso]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const changeStatus = async (status: BookingStatus) => {
    if (!selected) return;
    setActing(true);
    try {
      const r = await updateBookingStatus(selected.booking.id, status);
      setToast({ kind: 'ok', text: r.message });
      setSelected(null);
      await load(true);
    } catch (err) {
      setToast({ kind: 'err', text: err instanceof Error ? err.message : 'Cập nhật thất bại.' });
    } finally {
      setActing(false);
    }
  };

  const visibleDays = data?.days.slice(offset, offset + WINDOW) ?? [];
  const hours = data?.days[0]?.slots.map((s) => s.hour) ?? [];
  const canLeft = offset > 0;
  const canRight = data ? offset + WINDOW < data.days.length : false;

  const totals = data
    ? data.days.reduce(
        (acc, day) => {
          day.slots.forEach((s) =>
            s.bookings.forEach((b) => { acc[b.status] += 1; }),
          );
          return acc;
        },
        { pending: 0, approved: 0, rejected: 0 } as Record<BookingStatus, number>,
      )
    : { pending: 0, approved: 0, rejected: 0 };

  return (
    <div ref={calendarRef} className="flex flex-col h-full overflow-hidden scroll-mt-4">
      {/* Sub-header */}
      <div className="shrink-0 px-6 py-4 border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-white font-bold text-lg">Lịch đặt — 2 tuần</h2>
          <p className="text-white/50 text-sm mt-0.5">
            08:00–20:00 mỗi ngày (nghỉ Chủ Nhật) · tối đa {data?.capacity ?? 4} người / giờ
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 text-sm">
            <StatPill cls="bg-white/10 border-white/30 text-white/90" label={`Chờ: ${totals.pending}`} />
            <StatPill cls="bg-[#0F6B3E]/20 border-[#0F6B3E]/40 text-[#6ee7b7]" label={`Duyệt: ${totals.approved}`} />
            <StatPill cls="bg-red-500/15 border-red-500/40 text-red-300" label={`Từ chối: ${totals.rejected}`} />
          </div>
          <button type="button" onClick={() => load()} title="Làm mới"
            className="p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/5 transition-all">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Day navigation */}
      <div className="shrink-0 px-6 py-3 border-b border-white/8 flex items-center gap-3">
        <button type="button" disabled={!canLeft} onClick={() => setOffset((o) => o - 1)}
          className="p-2 rounded-lg border border-white/15 text-white/60 hover:text-white hover:border-[#0F6B3E]/60 disabled:opacity-25 transition-all">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-white/60 text-sm font-medium">
          {visibleDays[0] && visibleDays[visibleDays.length - 1]
            ? `${fmtDayLabel(visibleDays[0].date)} → ${fmtDayLabel(visibleDays[visibleDays.length - 1].date)}`
            : '—'}
        </span>
        <button type="button" disabled={!canRight} onClick={() => setOffset((o) => o + 1)}
          className="p-2 rounded-lg border border-white/15 text-white/60 hover:text-white hover:border-[#0F6B3E]/60 disabled:opacity-25 transition-all">
          <ChevronRight className="w-4 h-4" />
        </button>
        <span className="text-white/30 text-xs ml-1">
          {data ? `${offset + 1}–${Math.min(offset + WINDOW, data.days.length)} / ${data.days.length} ngày` : ''}
        </span>
      </div>

      {/* Calendar */}
      <div className="flex-1 overflow-auto p-4">
        {loading && !data ? (
          <div className="flex flex-col items-center justify-center py-24 text-white/40 gap-3">
            <Loader2 className="w-7 h-7 animate-spin" />
            <p className="text-base">Đang tải...</p>
          </div>
        ) : error ? (
          <div className="bg-red-400/10 border border-red-400/25 text-red-300 rounded-xl px-5 py-4 text-base">{error}</div>
        ) : data ? (
          <div style={{ minWidth: `${72 + visibleDays.length * 160}px` }}>
            {/* Header row */}
            <div className="grid sticky top-0 z-10"
              style={{ gridTemplateColumns: `72px repeat(${visibleDays.length}, minmax(150px, 1fr))` }}>
              <div className="bg-[#0A0A0A] border-b border-r border-white/10 p-3 flex items-center justify-center">
                <Clock className="w-4 h-4 text-white/40" />
              </div>
              {visibleDays.map((day) => {
                const isToday = day.date === todayIso;
                const dowIdx = new Date(day.date).getDay();
                return (
                  <div key={day.date}
                    className={`border-b border-white/10 p-3 text-center transition-colors ${
                      isToday ? 'bg-[#0F6B3E]' : 'bg-[#0A0A0A]'
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
              <div key={hour} className="grid"
                style={{ gridTemplateColumns: `72px repeat(${visibleDays.length}, minmax(150px, 1fr))` }}>
                {/* Hour label */}
                <div className={`border-r border-white/10 px-3 flex items-center justify-center text-sm font-semibold text-white/70 ${rowIdx % 2 === 0 ? 'bg-white/[0.02]' : ''}`}>
                  {String(hour).padStart(2, '0')}:00
                </div>
                {/* Booking cells */}
                {visibleDays.map((day) => {
                  const slot = day.slots[rowIdx];
                  const isToday = day.date === todayIso;
                  return (
                    <div key={day.date + hour}
                      className={`border-b border-r border-white/8 p-2 min-h-[88px] space-y-1.5 ${
                        rowIdx % 2 === 0 ? 'bg-white/[0.02]' : ''
                      } ${isToday ? 'bg-[#0F6B3E]/[0.05] border-l-2 border-l-[#0F6B3E]/40' : ''}`}>
                      {slot.bookings.map((b) => {
                        const meta = STATUS_META[b.status];
                        return (
                          <button key={b.id} type="button"
                            onClick={() => setSelected({ booking: b, dateIso: day.date, hour })}
                            className={`w-full text-left px-3 py-1.5 rounded-lg border text-sm leading-tight font-medium transition-all ${meta.pill}`}
                            title={`${b.customer_id} · ${meta.label}`}>
                            {b.customer_id}
                          </button>
                        );
                      })}
                      {/* Slot count */}
                      <div className="text-white/30 text-xs text-center">
                        {slot.bookings.length} / {data.capacity}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {/* Status-change modal */}
      {selected && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && setSelected(null)}>
          <div className="bg-[#111] border border-white/12 rounded-2xl w-full max-w-sm shadow-2xl p-6">
            <div className="flex items-start justify-between mb-5">
              <h3 className="text-white font-bold text-xl">Cập nhật lịch đặt</h3>
              <button type="button" onClick={() => setSelected(null)} className="text-white/40 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="bg-[#0F6B3E]/10 border border-[#0F6B3E]/25 rounded-xl p-4 mb-5 flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-[#0F6B3E]/25 flex items-center justify-center shrink-0">
                <CalendarCheck className="w-5 h-5 text-[#0F6B3E]" />
              </div>
              <div>
                <p className="text-white font-semibold text-base">{selected.booking.customer_id}</p>
                <p className="text-white/60 text-sm mt-0.5 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  {VIET_DAYS_FULL[new Date(selected.dateIso).getDay()]} · {fmtDayLabel(selected.dateIso)}
                </p>
                <p className="text-white/60 text-sm">
                  {String(selected.hour).padStart(2, '0')}:00 – {String(selected.hour + 1).padStart(2, '0')}:00
                </p>
                <span className={`inline-block mt-2 px-2.5 py-0.5 rounded-full border text-xs font-medium ${STATUS_META[selected.booking.status].pill}`}>
                  {STATUS_META[selected.booking.status].label}
                </span>
              </div>
            </div>
            <p className="text-white/50 text-sm mb-3">Đổi trạng thái thành:</p>
            <div className="grid grid-cols-3 gap-2">
              <button type="button" disabled={acting} onClick={() => changeStatus('approved')}
                className="flex flex-col items-center gap-1.5 py-3 rounded-xl border border-[#0F6B3E]/50 bg-[#0F6B3E]/15 hover:bg-[#0F6B3E]/30 text-[#6ee7b7] transition-all disabled:opacity-50">
                <Check className="w-5 h-5" />
                <span className="text-sm font-semibold">Chấp nhận</span>
              </button>
              <button type="button" disabled={acting} onClick={() => changeStatus('rejected')}
                className="flex flex-col items-center gap-1.5 py-3 rounded-xl border border-red-500/50 bg-red-500/10 hover:bg-red-500/25 text-red-300 transition-all disabled:opacity-50">
                <X className="w-5 h-5" />
                <span className="text-sm font-semibold">Từ chối</span>
              </button>
              <button type="button" disabled={acting} onClick={() => changeStatus('pending')}
                className="flex flex-col items-center gap-1.5 py-3 rounded-xl border border-white/20 bg-white/5 hover:bg-white/12 text-white/70 transition-all disabled:opacity-50">
                <RotateCcw className="w-5 h-5" />
                <span className="text-sm font-semibold">Chờ duyệt</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3.5 rounded-xl border shadow-2xl flex items-center gap-2.5 text-base font-medium ${
          toast.kind === 'ok' ? 'bg-[#0F6B3E] border-[#0F6B3E]/60 text-white' : 'bg-red-500 border-red-500/60 text-white'
        }`}>
          {toast.kind === 'ok' ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
          {toast.text}
        </div>
      )}
    </div>
  );
}

function StatPill({ cls, label }: { cls: string; label: string }) {
  return <span className={`px-3 py-1 rounded-full border text-sm font-medium ${cls}`}>{label}</span>;
}
