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
  ChevronLeft,
  ChevronRight,
  Clock,
  Maximize2,
  Minimize2,
  X,
} from 'lucide-react';
import {
  fetchBookings,
  type AdminBookingItem,
  type AdminBookings,
  type AdminBookingSlot,
  type BookingStatus,
} from '../../lib/api/admin';
import { cn } from '../shared/primitives/cn';
import { CapacityMarks } from '../shared/booking/CapacityMarks';
import { bookingAccessibleName, bookingStatusMeta } from '../shared/booking/statusMeta';
import { StatusBadge } from '../shared/booking/StatusBadge';
import { BookingStatusActions, useBookingStatusChange } from '../shared/booking/BookingStatusActions';
import { useToast } from '../shared/hooks/useToast';
import { useFreshness } from '../shared/hooks/useFreshness';
import { FreshnessIndicator } from '../shared/components/FreshnessIndicator';

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

/** Get ISO date string for today + offset days. */
function dateIsoOffset(offset: number) {
  const n = getNow();
  n.setDate(n.getDate() + offset);
  return `${n.getFullYear()}-${pad(n.getMonth() + 1)}-${pad(n.getDate())}`;
}

/** Get a Date object for today + offset days (in HCM timezone). */
function dateFromOffset(offset: number) {
  const n = getNow();
  n.setDate(n.getDate() + offset);
  return n;
}

/** Max forward days: 2 weeks (14 days) from today. */
const MAX_FORWARD_DAYS = 14;

/** Display order inside an hour row: attention states first, finished last. */
const KIOSK_ORDER: Record<BookingStatus, number> = {
  approved: 0,
  pending: 1,
  no_show: 2,
  completed: 3,
  rejected: 4,
};

// ── Types ──────────────────────────────────────────────────────────────────

interface TodaySlot {
  hour: number;
  /** Slot wall-clock time ("YYYY-MM-DDTHH:00", ICT). Empty for fallback rows. */
  time: string;
  bookings: AdminBookingItem[];
}

interface SelectedBooking {
  booking: AdminBookingItem;
  hour: number;
  time: string;
}

// ── Component ──────────────────────────────────────────────────────────────

export interface CalendarKioskProps {
  onClose: () => void;
}

export function CalendarKiosk({ onClose }: CalendarKioskProps) {
  const [now, setNow] = useState(getNow);
  const [dateOffset, setDateOffset] = useState(0); // 0 = today, +1 = tomorrow, etc.
  const [slots, setSlots] = useState<TodaySlot[]>([]);
  const [capacity, setCapacity] = useState(4);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selected, setSelected] = useState<SelectedBooking | null>(null);
  const { show: showToast, node: toastNode } = useToast();
  const [snapshot, setSnapshot] = useState<object | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const { lastUpdatedAt, offline } = useFreshness({ loading: false, error: loadFailed, data: snapshot });
  const containerRef = useRef<HTMLDivElement>(null);
  const currentRowRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const isToday = dateOffset === 0;
  const canGoBack = dateOffset > 0;
  const canGoForward = dateOffset < MAX_FORWARD_DAYS;
  const viewDateIso = dateIsoOffset(dateOffset);
  const viewDate = dateFromOffset(dateOffset);

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

  // Fetch bookings for the viewed date
  const loadData = useCallback(async () => {
    try {
      const data: AdminBookings = await fetchBookings();
      const targetDate = dateIsoOffset(dateOffset);
      const day = data.days.find((d) => d.date === targetDate);
      if (day) {
        setSlots(
          day.slots.map((s: AdminBookingSlot) => ({
            hour: s.hour,
            time: s.time,
            // U22: everything except rejected — attendance (Đã tập / Vắng) stays visible.
            bookings: s.bookings
              .filter((b) => b.status !== 'rejected')
              .sort((a, b) => (KIOSK_ORDER[a.status] ?? 9) - (KIOSK_ORDER[b.status] ?? 9)),
          })),
        );
      } else {
        // Date might be Sunday or outside the booking window
        setSlots(HOURS.map((h) => ({ hour: h, time: '', bookings: [] })));
      }
      setCapacity(data.capacity);
      setLoadFailed(false);
      setSnapshot({});
    } catch {
      // Silent retry on next poll — kiosk stays resilient; show the offline state.
      setLoadFailed(true);
    }
  }, [dateOffset]);

  useEffect(() => { loadData(); }, [loadData]);

  // Poll every 10s — pause while action dialog is open
  useEffect(() => {
    if (selected) return;
    const id = setInterval(loadData, 10_000);
    return () => clearInterval(id);
  }, [loadData, selected]);

  // Auto-scroll to current hour row on mount and when hour changes (only when viewing today)
  const currentHour = now.getHours();
  useEffect(() => {
    if (!isToday) return;
    setTimeout(() => {
      currentRowRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
  }, [currentHour, isToday]);

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
  const { change: changeBookingStatus, pending: acting } = useBookingStatusChange({
    show: showToast,
    refresh: loadData,
  });

  const changeStatus = async (next: BookingStatus, prev: BookingStatus) => {
    if (!selected) return;
    const ok = await changeBookingStatus(selected.booking, next, prev);
    if (ok) setSelected(null);
  };

  // Current time position for the "now" line (fraction within 08–20 range)
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const dayStartMin = 8 * 60;
  const dayEndMin = 20 * 60;
  const nowFraction = Math.max(0, Math.min(1, (currentMinutes - dayStartMin) / (dayEndMin - dayStartMin)));

  const hh = pad(now.getHours());
  const mm = pad(now.getMinutes());
  const ss = pad(now.getSeconds());
  const viewDayOfWeek = VIET_DAYS_FULL[viewDate.getDay()];
  const viewDateStr = fmtDate(viewDate);

  // Determine active slots (use data or fallback)
  const displaySlots: TodaySlot[] = slots.length > 0 ? slots : HOURS.map((h) => ({ hour: h, time: '', bookings: [] }));

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] bg-[#060606] text-white flex flex-col overflow-hidden"
    >
      {/* Header */}
      <header className="shrink-0 flex items-center justify-between px-3 py-2 md:px-5 md:py-3 lg:px-8 lg:py-5 border-b border-line">
        {/* Left: date info + navigation */}
        <div className="flex items-center gap-2 md:gap-3 lg:gap-4">
          <button
            type="button"
            disabled={!canGoBack}
            onClick={() => setDateOffset((o) => o - 1)}
            className="p-1.5 md:p-2 rounded-control border border-line-strong text-white/64 hover:text-white hover:bg-surface-2 disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
            aria-label="Ngày trước"
          >
            <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
          </button>
          <div className="flex flex-col items-center min-w-[56px] md:min-w-[70px] lg:min-w-[80px]">
            <span className="text-white/64 text-xs md:text-sm font-medium ">{viewDayOfWeek}</span>
            <span className="text-3xl md:text-4xl lg:text-5xl font-bold text-white tabular-nums leading-none mt-1">
              {pad(viewDate.getDate())}
            </span>
            <span className="text-white/64 text-xs mt-1">{viewDateStr}</span>
            {isToday && (
              <span className="mt-1 text-xs text-primary-text font-medium">
                Hôm nay
              </span>
            )}
          </div>
          <button
            type="button"
            disabled={!canGoForward}
            onClick={() => setDateOffset((o) => o + 1)}
            className="p-1.5 md:p-2 rounded-control border border-line-strong text-white/64 hover:text-white hover:bg-surface-2 disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
            aria-label="Ngày sau"
          >
            <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
          </button>
          <div className="hidden md:block h-14 w-px bg-line mx-2" />
          <div className="hidden md:flex flex-col gap-0.5 text-white/64 text-xs">
            <span>GMT+07 · TP. Hồ Chí Minh</span>
            <FreshnessIndicator lastUpdatedAt={lastUpdatedAt} offline={offline} />
          </div>
        </div>

        {/* Center: clock */}
        <div className="flex items-center gap-2 md:gap-3">
          <span className="text-xl md:text-2xl lg:text-4xl font-bold tabular-nums text-white">
            {hh}:{mm}
            <span className="text-sm md:text-lg lg:text-xl text-white/64 font-normal ml-1">:{ss}</span>
          </span>
        </div>

        {/* Right: controls */}
        <div className="flex items-center gap-2 md:gap-3">
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-2 md:p-2.5 rounded-control bg-white/5 border border-line text-white/64 hover:text-white hover:bg-white/10 transition-all"
            title={isFullscreen ? 'Thoát toàn màn hình' : 'Toàn màn hình'}
            aria-label={isFullscreen ? 'Thoát toàn màn hình' : 'Toàn màn hình'}
 >
 {isFullscreen ? <Minimize2 className="w-4 h-4 md:w-5 md:h-5" /> : <Maximize2 className="w-4 h-4 md:w-5 md:h-5" />}
 </button>
 <button
 type="button"
 onClick={onClose}
 className="p-2 md:p-2.5 rounded-control bg-white/5 border border-line text-white/64 hover:text-error-text hover:bg-red-400/10 transition-all"
 title="Đóng lịch để bàn (Esc)"
 aria-label="Đóng lịch để bàn"
 >
 <X className="w-4 h-4 md:w-5 md:h-5" />
 </button>
 </div>
 </header>

 {/* Day timeline */}
 <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-2 md:px-5 md:py-3 lg:px-8 lg:py-4 relative">
 {/* Now indicator line — only shown when viewing today */}
 {isToday && currentMinutes >= dayStartMin && currentMinutes <= dayEndMin && (
 <div
 className="absolute left-0 right-0 z-20 pointer-events-none flex items-center"
 style={{ top: `calc(${nowFraction * 100}% + 1rem)` }}
 >
 <div className="w-[62px] md:w-[65px] lg:w-20 flex items-center justify-end pr-2">
 <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-primary-text" />
 </div>
 <div className="flex-1 h-px bg-primary-text" />
 </div>
 )}

 {/* Hour rows */}
 {displaySlots.map((slot) => {
 const isCurrentHour = isToday && slot.hour === currentHour;
 const isPast = isToday && slot.hour < currentHour;
 // Every non-rejected booking occupies a seat (completed / no_show included).
 const totalCount = slot.bookings.length;

 return (
 <div
 key={slot.hour}
 ref={isCurrentHour ? currentRowRef : undefined}
 className={`grid grid-cols-[62px_1fr] md:grid-cols-[65px_1fr] lg:grid-cols-[80px_1fr] gap-2 md:gap-3 lg:gap-4 min-h-[60px] md:min-h-[80px] lg:min-h-[100px] border-b border-line transition-all ${
 isCurrentHour
 ? 'bg-white/[0.03] shadow-[inset_3px_0_0_#3dbe7a]'
                  : isPast
                  ? 'bg-white/[0.015]'
                  : ''
              }`}
            >
              {/* Hour label */}
              <div className="flex flex-col items-center justify-center py-4">
                <span className={`text-base lg:text-lg font-bold tabular-nums ${
                  isCurrentHour ? 'text-primary-text' : 'text-white/64'
                }`}>
                  {pad(slot.hour)}:00
                </span>
                {isCurrentHour && (
                  <span className="mt-1 text-xs leading-relaxed text-primary-text font-medium">
                    Hiện tại
                  </span>
                )}
                <span className="mt-1.5 flex items-center gap-1.5 text-sm text-white/64 tabular-nums">
                  <CapacityMarks taken={totalCount} capacity={capacity} />
                  {totalCount}/{capacity}
                </span>
              </div>

              {/* Booking cards — colour + icon + label for every status (FR-6) */}
              <div className="flex flex-wrap items-center gap-3 py-4 pr-4">
                {slot.bookings.map((b) => {
                  const meta = bookingStatusMeta[b.status] ?? bookingStatusMeta.pending;
                  const Icon = meta.Icon;
                  return (
                    <button
                      key={b.id}
                      type="button"
                      data-testid={`kiosk-booking-${b.status}`}
                      onClick={() => setSelected({ booking: b, hour: slot.hour, time: slot.time })}
                      aria-label={bookingAccessibleName({ customer_id: b.customer_id, time: slot.time, status: b.status })}
                      className={cn(
                        'tap-target flex items-center gap-2 md:gap-3 px-4 py-2.5 lg:px-5 lg:py-3 rounded-control border transition-colors cursor-pointer active:scale-[0.98]',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-text',
                        b.status === 'approved' && isCurrentHour
                          ? 'bg-primary-tint border-primary-text/40 hover:bg-[#0F6B3E]/30'
                          : 'bg-surface border-line hover:bg-surface-2',
                      )}
                    >
                      <Icon className={cn('w-5 h-5 shrink-0', meta.textClass)} aria-hidden="true" />
                      <span className={cn(
                        'font-semibold text-base lg:text-lg leading-relaxed',
                        meta.recede ? 'text-white/70' : 'text-white',
                      )}>
                        {b.customer_id}
                      </span>
                      <span className={cn('text-base leading-relaxed', meta.textClass)}>
                        · {meta.label}
                      </span>
                      {b.note && (
                        <span className="text-white/64 text-base ml-1 truncate max-w-[120px] lg:max-w-[180px]">
                          · {b.note}
                        </span>
                      )}
                    </button>
                  );
                })}
                {totalCount === 0 && !isPast && (
                  <span className="text-white/64 text-base italic">Trống</span>
                )}
              </div>
            </div>
          );
        })}
      </div>



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
            className="bg-overlay border border-line rounded-panel w-full max-w-sm shadow-2xl p-6"
          >
            <div className="flex items-start justify-between mb-5">
              <h3 className="text-white font-bold text-xl">Cập nhật lịch đặt</h3>
              <button
                type="button"
                onClick={() => setSelected(null)}
                aria-label="Đóng cập nhật lịch đặt"
                className="tap-target flex items-center justify-center rounded-lg text-white/64 hover:text-white hover:bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-text"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="bg-surface-2 border border-line rounded-control p-4 mb-5 flex items-start gap-4">
              <div>
                <p className="text-white font-semibold text-lg leading-relaxed">{selected.booking.customer_id}</p>
                <p className="text-white/64 text-base mt-0.5 flex items-center gap-1.5 tabular-nums">
                  <Clock className="w-4 h-4" aria-hidden="true" />
                  {pad(selected.hour)}:00 – {pad(selected.hour + 1)}:00
                </p>
                <StatusBadge status={selected.booking.status} size="md" className="mt-2" />
              </div>
            </div>

            <p className="text-white/64 text-base mb-3">Đổi trạng thái thành:</p>
            <BookingStatusActions
              booking={{
                id: selected.booking.id,
                customer_id: selected.booking.customer_id,
                time: selected.time,
                status: selected.booking.status,
              }}
              onChange={changeStatus}
              busy={acting}
              size="lg"
            />
          </div>
        </div>
      )}

      {/* Toast (shared useToast, with undo for reject / attendance) — above the kiosk overlay */}
      {toastNode && <div className="relative z-[120]">{toastNode}</div>}
    </div>
  );
}
