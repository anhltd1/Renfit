/**
 * CalendarKiosk — "Lịch để bàn" fullscreen kiosk mode.
 *
 * Designed for a gym tablet in fullscreen: shows today's approved/pending
 * bookings in a Google Calendar–style day view with a real-time clock,
 * current-time indicator line, and auto-scrolling to keep the current hour
 * in view. Refreshes data every 10 seconds.
 *
 * PTs can interact with bookings directly: click a pending booking to
 * approve/reject it, or click an approved booking to change its status.
 *
 * Activated from AdminBookings via the "Lịch để bàn" button; exits with
 * Escape or the close button.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  CalendarCheck,
  Check,
  Clock,
  Maximize2,
  Minimize2,
  RotateCcw,
  Users,
  X,
} from 'lucide-react';
import {
  fetchBookings,
  updateBookingStatus,
  type AdminBookingItem,
  type AdminBookings,
  type AdminBookingSlot,
  type BookingStatus,
} from '../../lib/api/admin';

// ── Helpers ────────────────────────────────────────────────────────────────

const HOURS = Array.from({ length: 13 }, (_, i) => i + 8); // 08–20
const VIET_DAYS_FULL = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];

function getNow() {
  return new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
}

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function fmtDate(d: Date) {
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

function todayIso() {
  const n = getNow();
  return `${n.getFullYear()}-${pad(n.getMonth() + 1)}-${pad(n.getDate())}`;
}

const STATUS_META: Record<BookingStatus, { label: string; pill: string }> = {
  pending: {
    label: 'Chờ duyệt',
    pill: 'bg-amber-500/30 border-amber-400/70 text-amber-200',
  },
  approved: {
    label: 'Đã duyệt',
    pill: 'bg-emerald-600/40 border-emerald-400/80 text-emerald-200',
  },
  rejected: {
    label: 'Từ chối',
    pill: 'bg-red-600/40 border-red-400/80 text-red-200',
  },
};

// ── Types ──────────────────────────────────────────────────────────────────

interface TodaySlot {
  hour: number;
  bookings: AdminBookingItem[];
}

interface SelectedBooking {
  booking: AdminBookingItem;
  hour: number;
}

// ── Component ──────────────────────────────────────────────────────────────

export interface CalendarKioskProps {
  onClose: () => void;
}

export function CalendarKiosk({ onClose }: CalendarKioskProps) {
  const [now, setNow] = useState(getNow);
  const [slots, setSlots] = useState<TodaySlot[]>([]);
  const [capacity, setCapacity] = useState(4);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selected, setSelected] = useState<SelectedBooking | null>(null);
  const [acting, setActing] = useState(false);
  const [toast, setToast] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const currentRowRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Clock tick every second
  useEffect(() => {
    const msUntilNextSecond = 1000 - (Date.now() % 1000);
    let id: ReturnType<typeof setInterval>;
    const timeout = setTimeout(() => {
      setNow(getNow());
      id = setInterval(() => setNow(getNow()), 1000);
    }, msUntilNextSecond);
    return () => { clearTimeout(timeout); clearInterval(id); };
  }, []);

  // Fetch today's bookings
  const loadData = useCallback(async () => {
    try {
      const data: AdminBookings = await fetchBookings();
      const today = todayIso();
      const day = data.days.find((d) => d.date === today);
      if (day) {
        setSlots(
          day.slots.map((s: AdminBookingSlot) => ({
            hour: s.hour,
            bookings: s.bookings.filter((b) => b.status === 'approved' || b.status === 'pending'),
          })),
        );
      } else {
        // Today might be Sunday or outside the window
        setSlots(HOURS.map((h) => ({ hour: h, bookings: [] })));
      }
      setCapacity(data.capacity);
    } catch {
      // Silently retry on next poll — kiosk should be resilient
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Poll every 10s — pause while action dialog is open
  useEffect(() => {
    if (selected) return;
    const id = setInterval(loadData, 10_000);
    return () => clearInterval(id);
  }, [loadData, selected]);

  // Auto-scroll to current hour row on mount and when hour changes
  const currentHour = now.getHours();
  useEffect(() => {
    setTimeout(() => {
      currentRowRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
  }, [currentHour]);

  // Escape to close (modal first, then kiosk)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selected) {
          setSelected(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, selected]);

  // Toast auto-dismiss
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  // Fullscreen API
  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await containerRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  // Status change action
  const changeStatus = async (status: BookingStatus) => {
    if (!selected) return;
    setActing(true);
    try {
      const r = await updateBookingStatus(selected.booking.id, status);
      setToast({ kind: 'ok', text: r.message });
      setSelected(null);
      await loadData();
    } catch (err) {
      setToast({ kind: 'err', text: err instanceof Error ? err.message : 'Cập nhật thất bại.' });
    } finally {
      setActing(false);
    }
  };

  // Current time position for the "now" line (fraction within 08–20 range)
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const dayStartMin = 8 * 60;
  const dayEndMin = 20 * 60;
  const nowFraction = Math.max(0, Math.min(1, (currentMinutes - dayStartMin) / (dayEndMin - dayStartMin)));

  const hh = pad(now.getHours());
  const mm = pad(now.getMinutes());
  const ss = pad(now.getSeconds());
  const dayOfWeek = VIET_DAYS_FULL[now.getDay()];
  const dateStr = fmtDate(now);

  // Determine active slots (use data or fallback)
  const displaySlots = slots.length > 0 ? slots : HOURS.map((h) => ({ hour: h, bookings: [] }));

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] bg-[#060606] text-white flex flex-col overflow-hidden"
    >
      {/* Header */}
      <header className="shrink-0 flex items-center justify-between px-8 py-5 border-b border-white/8">
        {/* Left: date info */}
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center">
            <span className="text-white/50 text-sm font-medium tracking-wide">{dayOfWeek}</span>
            <span className="text-5xl font-bold text-white tabular-nums leading-none mt-1">
              {pad(now.getDate())}
            </span>
            <span className="text-white/40 text-xs mt-1">{dateStr}</span>
          </div>
          <div className="h-14 w-px bg-white/10 mx-2" />
          <div className="text-white/30 text-xs">GMT+07 · TP. Hồ Chí Minh</div>
        </div>

        {/* Center: clock */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#0F6B3E]/20 border border-[#0F6B3E]/30 flex items-center justify-center">
            <Clock className="w-5 h-5 text-[#0F6B3E]" />
          </div>
          <span className="text-4xl font-bold tracking-wider tabular-nums text-white">
            {hh}<span className="animate-pulse text-[#0F6B3E]">:</span>{mm}
            <span className="text-xl text-white/30 font-normal ml-1">:{ss}</span>
          </span>
        </div>

        {/* Right: controls */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 transition-all"
            title={isFullscreen ? 'Thoát toàn màn hình' : 'Toàn màn hình'}
            aria-label={isFullscreen ? 'Thoát toàn màn hình' : 'Toàn màn hình'}
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white/50 hover:text-red-400 hover:bg-red-400/10 transition-all"
            title="Đóng lịch để bàn (Esc)"
            aria-label="Đóng lịch để bàn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Day timeline */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-8 py-4 relative">
        {/* Now indicator line — absolute positioned across the timeline */}
        {currentMinutes >= dayStartMin && currentMinutes <= dayEndMin && (
          <div
            className="absolute left-0 right-0 z-20 pointer-events-none flex items-center"
            style={{ top: `calc(${nowFraction * 100}% + 1rem)` }}
          >
            <div className="w-20 flex items-center justify-end pr-2">
              <div className="w-3 h-3 rounded-full bg-[#0F6B3E] shadow-[0_0_10px_rgba(15,107,62,0.8)]" />
            </div>
            <div className="flex-1 h-0.5 bg-[#0F6B3E] shadow-[0_0_8px_rgba(15,107,62,0.5)]" />
          </div>
        )}

        {/* Hour rows */}
        {displaySlots.map((slot) => {
          const isCurrentHour = slot.hour === currentHour;
          const isPast = slot.hour < currentHour;
          const approvedBookings = slot.bookings.filter((b) => b.status === 'approved');
          const pendingBookings = slot.bookings.filter((b) => b.status === 'pending');
          const totalCount = slot.bookings.length;

          return (
            <div
              key={slot.hour}
              ref={isCurrentHour ? currentRowRef : undefined}
              className={`grid grid-cols-[80px_1fr] gap-4 min-h-[100px] border-b border-white/6 transition-all ${
                isCurrentHour
                  ? 'bg-[#0F6B3E]/8 border-l-4 border-l-[#0F6B3E] rounded-r-xl'
                  : isPast
                  ? 'opacity-40'
                  : ''
              }`}
            >
              {/* Hour label */}
              <div className="flex flex-col items-center justify-center py-4">
                <span className={`text-lg font-bold tabular-nums ${
                  isCurrentHour ? 'text-[#0F6B3E]' : 'text-white/60'
                }`}>
                  {pad(slot.hour)}:00
                </span>
                {isCurrentHour && (
                  <span className="mt-1 text-[10px] bg-[#0F6B3E]/30 text-[#0F6B3E] px-2 py-0.5 rounded-full font-semibold border border-[#0F6B3E]/40">
                    Hiện tại
                  </span>
                )}
                {totalCount > 0 && (
                  <span className="mt-1.5 flex items-center gap-1 text-xs text-white/40">
                    <Users className="w-3 h-3" />
                    {totalCount}/{capacity}
                  </span>
                )}
              </div>

              {/* Booking cards */}
              <div className="flex flex-wrap items-center gap-3 py-4 pr-4">
                {approvedBookings.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setSelected({ booking: b, hour: slot.hour })}
                    className={`flex items-center gap-3 px-5 py-3 rounded-xl border transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${
                      isCurrentHour
                        ? 'bg-[#0F6B3E]/20 border-[#0F6B3E]/50 shadow-[0_0_15px_rgba(15,107,62,0.2)] hover:bg-[#0F6B3E]/30'
                        : 'bg-white/5 border-white/10 hover:bg-white/8 hover:border-white/20'
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full shrink-0 ${
                      isCurrentHour ? 'bg-[#0F6B3E] animate-pulse' : 'bg-emerald-400'
                    }`} />
                    <span className={`font-semibold text-base leading-relaxed ${
                      isCurrentHour ? 'text-white' : 'text-white/80'
                    }`}>
                      {b.customer_id}
                    </span>
                    {b.note && (
                      <span className="text-white/30 text-sm ml-1 truncate max-w-[150px]">
                        · {b.note}
                      </span>
                    )}
                  </button>
                ))}
                {pendingBookings.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setSelected({ booking: b, hour: slot.hour })}
                    className="flex items-center gap-3 px-5 py-3 rounded-xl border border-amber-400/30 bg-amber-500/10 transition-all cursor-pointer hover:scale-[1.02] hover:bg-amber-500/20 hover:border-amber-400/50 active:scale-[0.98]"
                  >
                    <div className="w-2 h-2 rounded-full shrink-0 bg-amber-400 animate-pulse" />
                    <span className="font-semibold text-base text-amber-200/80 leading-relaxed">
                      {b.customer_id}
                    </span>
                    <span className="text-amber-400/60 text-xs ml-1">(chờ duyệt)</span>
                  </button>
                ))}
                {totalCount === 0 && !isPast && (
                  <span className="text-white/20 text-sm italic">Trống</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <footer className="shrink-0 px-8 py-3 border-t border-white/8 flex items-center justify-between text-xs text-white/30">
        <span>Lịch để bàn · Renfit Gym</span>
        <span>Nhấn vào lịch hẹn để thay đổi trạng thái · Esc để đóng</span>
      </footer>

      {/* Status-change modal */}
      {selected && (
        <div
          className="fixed inset-0 z-[110] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && setSelected(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Cập nhật lịch đặt"
            className="bg-[#111] border border-white/12 rounded-2xl w-full max-w-sm shadow-2xl p-6"
          >
            <div className="flex items-start justify-between mb-5">
              <h3 className="text-white font-bold text-xl">Cập nhật lịch đặt</h3>
              <button
                type="button"
                onClick={() => setSelected(null)}
                aria-label="Đóng"
                className="text-white/40 hover:text-white transition-colors"
              >
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
                  {pad(selected.hour)}:00 – {pad(selected.hour + 1)}:00
                </p>
                <span className={`inline-block mt-2 px-2.5 py-0.5 rounded-full border text-xs font-medium ${STATUS_META[selected.booking.status].pill}`}>
                  {STATUS_META[selected.booking.status].label}
                </span>
              </div>
            </div>

            <p className="text-white/50 text-sm mb-3">Đổi trạng thái thành:</p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                disabled={acting}
                onClick={() => changeStatus('approved')}
                className="flex flex-col items-center gap-1.5 py-3 rounded-xl border border-[#0F6B3E]/50 bg-[#0F6B3E]/15 hover:bg-[#0F6B3E]/30 text-[#6ee7b7] transition-all disabled:opacity-50"
              >
                <Check className="w-5 h-5" />
                <span className="text-sm font-semibold">Chấp nhận</span>
              </button>
              <button
                type="button"
                disabled={acting}
                onClick={() => changeStatus('rejected')}
                className="flex flex-col items-center gap-1.5 py-3 rounded-xl border border-red-500/50 bg-red-500/10 hover:bg-red-500/25 text-red-300 transition-all disabled:opacity-50"
              >
                <X className="w-5 h-5" />
                <span className="text-sm font-semibold">Từ chối</span>
              </button>
              <button
                type="button"
                disabled={acting}
                onClick={() => changeStatus('pending')}
                className="flex flex-col items-center gap-1.5 py-3 rounded-xl border border-white/20 bg-white/5 hover:bg-white/12 text-white/70 transition-all disabled:opacity-50"
              >
                <RotateCcw className="w-5 h-5" />
                <span className="text-sm font-semibold">Chờ duyệt</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[120] px-4 w-full max-w-sm flex justify-center">
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
