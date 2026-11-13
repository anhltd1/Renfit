import { useCallback, useEffect, useRef, useState } from 'react';
import {
  CalendarCheck,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Layers,
  Loader2,
  Lock,
  Plus,
  RefreshCw,
  Search,
  UserRound,
  X,
} from 'lucide-react';
import { CalendarKiosk } from './CalendarKiosk';
import { BlockOffManager } from './BlockOffManager';
import { BatchBookingMode } from './BatchBookingMode';
import { useBatchBooking } from '../shared/hooks/useBatchBooking';
import {
  assignBooking,
  fetchBookings,
  fetchCustomers,
  type AdminBookingItem,
  type AdminBookings as AdminBookingsData,
  type AdminBookingDay,
  type BookingStatus,
  type CustomerSummary,
} from '../../lib/api/admin';
import { useFocusTrap } from '../shared/primitives/useFocusTrap';
import { cn } from '../shared/primitives/cn';
import { CapacityMarks } from '../shared/booking/CapacityMarks';
import { bookingAccessibleName, bookingStatusMeta } from '../shared/booking/statusMeta';
import { StatusBadge } from '../shared/booking/StatusBadge';
import { BookingStatusActions, useBookingStatusChange } from '../shared/booking/BookingStatusActions';
import { matchesQuery } from '../shared/text/normalizeVi';
import { useToast } from '../shared/hooks/useToast';
import { useFreshness } from '../shared/hooks/useFreshness';
import { FreshnessIndicator } from '../shared/components/FreshnessIndicator';

/**
 * U8 Accessibility — this component's two hand-rolled overlays (status-
 * change, assign-booking) predate the shared `Modal` primitive and are kept
 * as-is visually (reuse-as-is precedent, DL-3/BOOK-ADMIN-1) but gain the
 * same Escape-to-close + focus-trap behavior `Modal`/`Sheet` provide, via
 * the shared `useFocusTrap` hook, rather than duplicating that logic ad hoc.
 */
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

type RenderAdminDay =
  | { kind: 'sunday'; date: string }
  | { kind: 'working'; day: AdminBookingDay };

function withSundays(days: AdminBookingDay[]): RenderAdminDay[] {
  const result: RenderAdminDay[] = [];
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

/** Capacity-consuming bookings (U22: completed / no_show keep their seat). */
function occupiedCount(bookings: AdminBookingItem[]): number {
  return bookings.filter((b) => b.status !== 'rejected').length;
}

const EMPTY_TOTALS: Record<BookingStatus, number> = {
  pending: 0,
  approved: 0,
  rejected: 0,
  completed: 0,
  no_show: 0,
};

interface Selected {
  booking: AdminBookingItem;
  dateIso: string;
  hour: number;
  /** Slot wall-clock time ("YYYY-MM-DDTHH:00", ICT) — decides attendance actions. */
  time: string;
}

export interface AdminBookingsProps {
  /** Rendered at the right end of the sub-header (U23). */
  headerActions?: React.ReactNode;
}

export function AdminBookings({ headerActions }: AdminBookingsProps = {}) {
  const todayIso = new Date().toISOString().slice(0, 10);

  const [data, setData] = useState<AdminBookingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [offset, setOffset] = useState(0);
  const [slideDir, setSlideDir] = useState<'left' | 'right' | null>(null);
  const [slideKey, setSlideKey] = useState(0);
  const [selected, setSelected] = useState<Selected | null>(null);
  const { show: showToast, node: toastNode } = useToast();
  const { lastUpdatedAt, offline } = useFreshness({ loading, error, data });

  // ── Assign-booking state ────────────────────────────────────────────────
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [assigning, setAssigning] = useState<{ dateIso: string; hour: number; time: string } | null>(null);
  const [assignSearch, setAssignSearch] = useState('');
  const [assignCustomerId, setAssignCustomerId] = useState('');
  const [assignActing, setAssignActing] = useState(false);

  const calendarRef = useRef<HTMLDivElement>(null);
  const didAutoScroll = useRef(false);
  const currentHourRowRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const statusDialogRef = useRef<HTMLDivElement>(null);
  const assignDialogRef = useRef<HTMLDivElement>(null);

  // Kiosk mode state
  const [kioskOpen, setKioskOpen] = useState(false);

  // Block-off manager state
  const [blockOff, setBlockOff] = useState<{ date: string; hour?: number } | null>(null);

  // Batch booking mode
  const batch = useBatchBooking();

  // Get current HCM hour for highlighting
  const nowHCM = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
  const currentHour = nowHCM.getHours();

  const load = useCallback(async (silent = false) => {
    if (!silent) {
      setLoading(true);
      setError('');
    }
    try {
      setData(await fetchBookings());
      setError('');
    } catch (err) {
      if (silent) return; // background refresh never replaces the calendar with an error
      setError(err instanceof Error ? err.message : 'Không tải được lịch đặt.');
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Pre-load customer list for the assign modal
  useEffect(() => {
    fetchCustomers().then(setCustomers).catch(() => {});
  }, []);

  // Snap to today when data arrives + auto-scroll.
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
      // Scroll the calendar body to the current hour
      setTimeout(() => {
        currentHourRowRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 350);
    }, 100);
  }, [data, todayIso]);

  // Silent background refresh every 5 s.
  // Pause while the status-change modal is open to avoid jarring updates mid-action.
  const selectedRef = useRef(selected);
  useEffect(() => { selectedRef.current = selected; }, [selected]);
  useEffect(() => {
    const id = setInterval(() => {
      if (!selectedRef.current) load(true);
    }, 5000);
    return () => clearInterval(id);
  }, [load]);

  useEscapeToClose(!!selected, () => setSelected(null));
  useEscapeToClose(!!assigning, () => setAssigning(null));
  useFocusTrap(!!selected, statusDialogRef);
  useFocusTrap(!!assigning, assignDialogRef);

  const refreshSilently = useCallback(() => load(true), [load]);
  const { change: changeBookingStatus, pending: acting } = useBookingStatusChange({
    show: showToast,
    refresh: refreshSilently,
  });

  const changeStatus = async (next: BookingStatus, prev: BookingStatus) => {
    if (!selected) return;
    const ok = await changeBookingStatus(selected.booking, next, prev);
    if (ok) setSelected(null);
  };

  const visibleDays = data?.days.slice(offset, offset + WINDOW) ?? [];
  const renderDays = withSundays(visibleDays);
  const hours = data?.days[0]?.slots.map((s) => s.hour) ?? [];
  const canLeft = offset > 0;
  const canRight = data ? offset + WINDOW < data.days.length : false;

  const totals = data
    ? data.days.reduce(
        (acc, day) => {
          day.slots.forEach((s) =>
            s.bookings.forEach((b) => {
              if (b.status in acc) acc[b.status] += 1;
            }),
          );
          return acc;
        },
        { ...EMPTY_TOTALS },
      )
    : EMPTY_TOTALS;

  return (
    <div ref={calendarRef} className="flex flex-col h-full min-h-0 overflow-hidden scroll-mt-4">
      {/* Sub-header (clears the notch on the mobile PWA; --safe-top is 0 on desktop) */}
      <div
        className="shrink-0 px-4 pb-3 border-b border-line flex flex-wrap items-center justify-between gap-2"
        style={{ paddingTop: 'max(0.75rem, var(--safe-top, 0px))' }}
 >
 <div>
 <h2 className="text-white text-2xl font-semibold leading-tight">Lịch đặt <span className="text-white/64 text-sm font-normal">2 tuần</span></h2>
 </div>
 <div className="flex items-center gap-3">
 <FreshnessIndicator lastUpdatedAt={lastUpdatedAt} offline={offline} />
 <div className="hidden md:flex items-center gap-2 text-sm">
 <StatPill status="pending" label={`Chờ: ${totals.pending}`} />
 <StatPill status="approved" label={`Duyệt: ${totals.approved}`} />
 <StatPill status="rejected" label={`Từ chối: ${totals.rejected}`} />
 {totals.completed > 0 && <StatPill status="completed" label={`Đã tập: ${totals.completed}`} />}
 {totals.no_show > 0 && <StatPill status="no_show" label={`Vắng: ${totals.no_show}`} />}
 </div>
 <button type="button" onClick={() => setKioskOpen(true)} title="Lịch để bàn" aria-label="Lịch để bàn"
 className="flex items-center gap-1.5 px-3 py-2 rounded-control text-white/80 hover:text-white hover:bg-surface-2 border border-line-strong transition-all text-sm tap-target">
 <CalendarDays className="w-4 h-4" />
 <span className="hidden lg:inline">Lịch để bàn</span>
 </button>
 <button type="button" onClick={() => { const today = new Date().toISOString().slice(0, 10); setBlockOff({ date: today }); }} title="Chặn giờ" aria-label="Chặn giờ"
 className="flex items-center gap-1.5 px-3 py-2 rounded-control text-white/80 hover:text-white hover:bg-surface-2 border border-line-strong transition-all text-sm tap-target">
 <Lock className="w-4 h-4" />
 <span className="hidden lg:inline">Chặn giờ</span>
 </button>
 <button type="button" onClick={() => (batch.active ? batch.deactivate() : batch.activate())}
 title={batch.active ? 'Thoát chế độ đặt loạt' : 'Đặt lịch loạt'} aria-label="Đặt lịch loạt"
 className={`tap-target flex items-center gap-1.5 px-3 py-2 rounded-control border transition-all text-sm ${
 batch.active
 ? 'text-white bg-surface-3 border-white/40'
                : 'text-white/80 hover:text-white hover:bg-surface-2 border-line-strong'
            }`}>
            <Layers className="w-4 h-4" />
            <span className="hidden lg:inline">{batch.active ? 'Đang đặt loạt' : 'Đặt lịch loạt'}</span>
 </button>
 <button type="button" onClick={() => load()} title="Làm mới" aria-label="Làm mới"
 className="tap-target flex items-center justify-center p-2 rounded-control text-white/64 hover:text-white hover:bg-white/5 transition-all">
 <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          {headerActions}
        </div>
      </div>

      {/* Day navigation */}
      <div className="shrink-0 px-4 py-2 border-b border-line flex items-center gap-3">
        <button type="button" disabled={!canLeft} onClick={() => { setSlideDir('right'); setSlideKey((k) => k + 1); setOffset((o) => o - 1); }}
 aria-label="Xem ngày trước"
 className="p-2 rounded-lg border border-white/15 text-white/64 hover:text-white hover:border-white/20 disabled:opacity-25 transition-all">
 <ChevronLeft className="w-4 h-4" />
 </button>
 <span className="text-white/64 text-sm font-medium">
 {visibleDays[0] && visibleDays[visibleDays.length - 1]
 ? `${fmtDayLabel(visibleDays[0].date)} → ${fmtDayLabel(visibleDays[visibleDays.length - 1].date)}`
 : '—'}
        </span>
        <button type="button" disabled={!canRight} onClick={() => { setSlideDir('left'); setSlideKey((k) => k + 1); setOffset((o) => o + 1); }}
 aria-label="Xem ngày sau"
 className="p-2 rounded-lg border border-white/15 text-white/64 hover:text-white hover:border-white/20 disabled:opacity-25 transition-all">
 <ChevronRight className="w-4 h-4" />
 </button>
 <span className="text-white/64 text-xs ml-1">
 {data ? `${offset + 1}–${Math.min(offset + WINDOW, data.days.length)} / ${data.days.length} ngày` : ''}
        </span>
      </div>

      {/* Calendar */}
      <div ref={scrollContainerRef} className="flex-1 min-h-0 overflow-auto overscroll-contain p-4">
        {loading && !data ? (
          <div className="flex flex-col items-center justify-center py-24 text-white/64 gap-3">
            <Loader2 className="w-7 h-7 animate-spin" />
            <p className="text-base">Đang tải...</p>
          </div>
        ) : error && !data ? (
          <div className="bg-red-400/10 border border-red-400/25 text-error-text rounded-control px-5 py-4 text-base">{error}</div>
        ) : data ? (
          <div
            key={slideKey}
            className={slideDir === 'left' ? 'animate-slide-in-left' : slideDir === 'right' ? 'animate-slide-in-right' : ''}
            style={{ minWidth: `${72 + renderDays.length * 160}px` }}
          >
            {/* Header row */}
            <div className="grid sticky top-0 z-10"
              style={{ gridTemplateColumns: `72px repeat(${renderDays.length}, minmax(150px, 1fr))` }}>
              <div className="bg-[#0B0B0B] border-b border-r border-line p-3 flex items-center justify-center sticky left-0 z-20">
                <Clock className="w-4 h-4 text-white/64" />
              </div>
              {renderDays.map((entry) => {
                if (entry.kind === 'sunday') {
                  return (
                    <div key={entry.date} className="border-b border-line p-3 text-center bg-[#0B0B0B]">
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
                    className={`p-3 text-center bg-[#0B0B0B] border-b ${isToday ? 'border-b-2 border-b-primary-text' : 'border-line'}`}>
                    <p className="font-semibold text-sm leading-tight text-white">{VIET_DAYS[dowIdx]}</p>
                    <p className="text-xs mt-0.5 text-white/64 tabular-nums">{fmtDayLabel(day.date)}</p>
                    {isToday && <p className="text-xs mt-1 text-primary-text font-medium">Hôm nay</p>}
                  </div>
                );
              })}
            </div>

            {/* Hour rows */}
            {hours.map((hour, rowIdx) => {
              const isCurrentHour = hour === currentHour;
              return (
              <div
                key={hour}
                ref={isCurrentHour ? currentHourRowRef : undefined}
                className="grid"
                style={{ gridTemplateColumns: `72px repeat(${renderDays.length}, minmax(150px, 1fr))` }}
              >
                {/* Hour label */}
                <div className={`relative border-r border-line px-3 flex items-start justify-end pt-2 text-xs font-medium tabular-nums sticky left-0 z-[5] bg-[#0B0B0B] ${
                  isCurrentHour ? 'text-primary-text' : 'text-white/64'
                }`}>
                  {isCurrentHour && <span aria-hidden="true" className="absolute right-0 top-0 bottom-0 w-0.5 bg-primary-text" />}
                  {String(hour).padStart(2, '0')}:00
                </div>
                {/* Booking cells */}
                {renderDays.map((entry) => {
                  if (entry.kind === 'sunday') {
                    return (
                      <div key={entry.date + hour}
                        className="border-b border-r border-line min-h-[88px] relative overflow-hidden" aria-hidden="true">
                        <div className="absolute inset-0" style={{ background: 'repeating-linear-gradient(-45deg, transparent 0px, transparent 7px, rgba(255,255,255,0.05) 7px, rgba(255,255,255,0.05) 8px)' }} />
                      </div>
                    );
                  }
                  const day = entry.day;
                  const slot = day.slots[rowIdx];
                  const isToday = day.date === todayIso;
                  const isNowCell = isCurrentHour && isToday;
                  const isBlocked = !!slot.blocked;
                  const openAssign = () => {
                    // Blocked slots can't be assigned
                    if (isBlocked) return;
                    // In batch mode, toggle the slot instead of opening assign dialog
                    if (batch.active && batch.member) {
                      batch.toggleSlot(slot.time);
                      return;
                    }
                    setAssigning({ dateIso: day.date, hour, time: slot.time });
                    setAssignSearch('');
                    setAssignCustomerId('');
                  };
                  const isStaged = batch.active && batch.stagedSlots.has(slot.time);

                  // Blocked slot — render with diagonal hatch (like Sunday)
                  if (isBlocked) {
                    return (
                      <div key={day.date + hour}
                        className="border-b border-r border-line min-h-[88px] relative overflow-hidden"
                        title="Đã chặn"
                      >
                        {/* Blocked = the same 1px hatch as a closed day, plus its label */}
                        <div className="absolute inset-0" style={{ background: 'repeating-linear-gradient(-45deg, transparent 0px, transparent 7px, rgba(255,255,255,0.07) 7px, rgba(255,255,255,0.07) 8px)' }} />
                        <div className="relative flex items-center justify-center h-full p-2">
                          <span className="text-xs bg-[#0B0B0B] text-white/80 px-2 py-0.5 rounded-chip font-medium border border-line-strong">
                            Đã chặn
                          </span>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={day.date + hour}
                      role="button"
                      tabIndex={0}
                      onClick={openAssign}
                      onKeyDown={(e) => {
                        if (e.key !== 'Enter' && e.key !== ' ') return;
                        e.preventDefault();
                        openAssign();
                      }}
                      aria-label={`Đặt lịch tập lúc ${String(hour).padStart(2, '0')}:00 ${fmtDayLabel(day.date)}`}
                      className={`border-b border-r border-line p-2 min-h-[88px] space-y-1.5 relative group/cell cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-text ${
                        isStaged
                          ? 'bg-primary-tint outline outline-1 outline-dashed outline-primary-text/60 -outline-offset-2'
                          : isNowCell
                          ? 'bg-white/[0.04] shadow-[inset_0_2px_0_#3dbe7a] hover:bg-surface-2'
                          : isToday
                          ? 'bg-white/[0.025] hover:bg-surface-2'
                          : 'hover:bg-surface-2'
                      }`}>
                      {isStaged && <Check data-testid="staged-check" aria-hidden="true" className="w-4 h-4 text-primary-text absolute right-2 top-2 pointer-events-none" />}
                      {/* Hover ring overlay (border colour only, no transform) */}

                      {slot.bookings.map((b) => {
                        const meta = bookingStatusMeta[b.status] ?? bookingStatusMeta.pending;
                        const Icon = meta.Icon;
                        return (
                          <button key={b.id} type="button"
                            data-testid={`booking-pill-${b.status}`}
                            onClick={(e) => { e.stopPropagation(); setSelected({ booking: b, dateIso: day.date, hour, time: slot.time }); }}
                            aria-label={bookingAccessibleName({ customer_id: b.customer_id, time: slot.time, status: b.status })}
                            className={cn(
                              'w-full flex items-center gap-1.5 text-left px-2.5 py-1.5 rounded-control text-sm leading-tight font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-text',
                              'tap-target',
                              meta.pillClass,
                              'no-underline',
                            )}>
                            <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                            <span className={cn('block truncate', meta.strike && 'line-through')}>{b.customer_id}</span>
                          </button>
                        );
                      })}

                      {/* Persistent faint "+" while the slot has free capacity */}
                      {slot.bookings.length === 0 && data.capacity > 0 && (
                        <Plus
                          data-testid="cell-free-plus"
                          aria-hidden="true"
                          className="w-4 h-4 text-white/64 group-hover/cell:text-primary-text absolute right-2 top-2 pointer-events-none"
                        />
                      )}

                      {/* Count + hover assign hint */}
                      <div className="flex items-center justify-between pt-0.5">
                        <span className="inline-flex items-center gap-1.5 text-white/64 text-xs tabular-nums">
                          <CapacityMarks taken={occupiedCount(slot.bookings)} capacity={data.capacity} variant="bars" />
                          {occupiedCount(slot.bookings)}/{data.capacity}
                        </span>
                        <span className="flex items-center gap-0.5 text-primary-text/0 group-hover/cell:text-primary-text text-xs font-semibold transition-colors">
                          <Plus className="w-3 h-3" /> Đặt lịch
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
            })}
          </div>
        ) : null}
      </div>

      {/* Status-change modal */}
      {selected && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && setSelected(null)}>
          <div ref={statusDialogRef} role="dialog" aria-modal="true" aria-label="Cập nhật lịch đặt" tabIndex={-1}
            className="bg-overlay border border-white/12 rounded-panel w-full max-w-sm shadow-2xl p-6">
            <div className="flex items-start justify-between mb-5">
              <h3 className="text-white font-bold text-xl">Cập nhật lịch đặt</h3>
              <button type="button" onClick={() => setSelected(null)} aria-label="Đóng cập nhật lịch đặt"
                className="tap-target flex items-center justify-center rounded-lg text-white/64 hover:text-white hover:bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-text">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="bg-surface-2 border border-line rounded-control p-4 mb-5 flex items-start gap-4">
              <div>
                <p className="text-white font-semibold text-base">{selected.booking.customer_id}</p>
                <p className="text-white/64 text-sm mt-0.5 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  {VIET_DAYS_FULL[new Date(selected.dateIso).getDay()]} · {fmtDayLabel(selected.dateIso)}
                </p>
                <p className="text-white/64 text-sm">
                  {String(selected.hour).padStart(2, '0')}:00 – {String(selected.hour + 1).padStart(2, '0')}:00
                </p>
                <StatusBadge status={selected.booking.status} size="md" className="mt-2" />
              </div>
            </div>
            <p className="text-white/64 text-sm mb-3">Đổi trạng thái thành:</p>
            <BookingStatusActions
              booking={{
                id: selected.booking.id,
                customer_id: selected.booking.customer_id,
                time: selected.time,
                status: selected.booking.status,
              }}
              onChange={changeStatus}
              busy={acting}
            />
          </div>
        </div>
      )}

      {/* Assign-booking modal */}
      {assigning && (() => {
        const filtered = customers.filter((c) => matchesQuery([c.id, c.phone_number], assignSearch));
        return (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setAssigning(null)}>
            <div ref={assignDialogRef} role="dialog" aria-modal="true" aria-label="Đặt lịch tập cho hội viên" tabIndex={-1}
              className="bg-overlay border border-white/12 rounded-panel w-full max-w-sm shadow-2xl p-6 flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-start justify-between">
                <h3 className="text-white font-bold text-xl">Đặt lịch tập cho hội viên</h3>
                <button type="button" onClick={() => setAssigning(null)} aria-label="Đóng đặt lịch tập"
                  className="tap-target flex items-center justify-center rounded-lg text-white/64 hover:text-white hover:bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-text">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Time info */}
              <div className="bg-surface-2 border border-line rounded-control p-4 flex items-center gap-4">
                <div>
                  <p className="text-white font-semibold text-sm">
                    {VIET_DAYS_FULL[new Date(assigning.dateIso).getDay()]} · {fmtDayLabel(assigning.dateIso)}
                  </p>
                  <p className="text-white/64 text-sm flex items-center gap-1.5 mt-0.5">
                    <Clock className="w-3.5 h-3.5" />
                    {String(assigning.hour).padStart(2, '0')}:00 – {String(assigning.hour + 1).padStart(2, '0')}:00
                  </p>
                </div>
              </div>

              {/* Customer search + select */}
              <div>
                <label htmlFor="assign-member-search" className="block text-white/70 text-sm font-semibold mb-2">Chọn hội viên</label>
                <div className="relative mb-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/64" aria-hidden="true" />
                  <input
                    id="assign-member-search"
                    data-testid="input-assign-search"
                    type="search" placeholder="Tìm theo tên hoặc số điện thoại..."
                    value={assignSearch}
                    onChange={(e) => setAssignSearch(e.target.value)}
                    className="w-full bg-surface-2 border border-line-strong rounded-control pl-9 pr-3 py-2.5 text-sm text-white placeholder-white/40 outline-none focus:border-primary-text transition-colors"
                  />
                </div>
                <div className="max-h-[160px] overflow-y-auto flex flex-col gap-1 pr-0.5">
                  {filtered.length === 0 ? (
                    <p className="text-white/64 text-sm text-center py-3">Không tìm thấy hội viên</p>
                  ) : (
                    filtered.map((c) => (
                      <button key={c.id} type="button"
                        onClick={() => setAssignCustomerId(c.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-control border text-sm text-left transition-all ${
 assignCustomerId === c.id
 ? 'bg-surface-3 border-white/40 text-white'
 : 'bg-surface border-line text-white/70 hover:border-white/20 hover:text-white'
 }`}>
                        <UserRound className="w-4 h-4 shrink-0 text-white/64" />
                        <span className="truncate font-medium">{c.id}</span>
                        {assignCustomerId === c.id && <Check className="w-4 h-4 ml-auto shrink-0 text-primary-text" />}
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3">
                <button type="button" onClick={() => setAssigning(null)}
                  className="flex-1 bg-surface-2 hover:bg-surface-3 border border-line-strong text-white py-3 rounded-control text-sm transition-all">
                  Huỷ
                </button>
                <button type="button" disabled={!assignCustomerId || assignActing}
                  onClick={async () => {
                    if (!assignCustomerId) return;
                    setAssignActing(true);
                    try {
                      await assignBooking(assignCustomerId, assigning.time);
                      setAssigning(null);
                      await load(true);
                      const assignedId = assignCustomerId;
                      showToast({
                        kind: 'ok',
                        text: `Đã đặt lịch tập cho ${assignedId}.`,
                        action: {
                          label: 'Đặt thêm buổi',
                          onClick: () => {
                            const m = customers.find((c) => c.id === assignedId);
                            if (m) batch.activate(m);
                          },
                        },
                      });
                    } catch (err) {
                      showToast({ kind: 'err', text: err instanceof Error ? err.message : 'Đặt lịch thất bại.' });
                    } finally {
                      setAssignActing(false);
                    }
                  }}
                  className="flex-1 py-3 rounded-control text-sm font-semibold text-white bg-primary hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed transition-all ">
                  {assignActing ? 'Đang xử lý...' : 'Đặt lịch tập'}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Toast (shared useToast — undo action for status changes) */}
      {toastNode}

      {/* Kiosk mode */}
      {kioskOpen && <CalendarKiosk onClose={() => setKioskOpen(false)} />}

      {/* Block-off manager */}
      {blockOff && (
        <BlockOffManager
          date={blockOff.date}
          preSelectedHour={blockOff.hour}
          onClose={() => setBlockOff(null)}
          onDone={() => { setBlockOff(null); load(true); }}
        />
      )}

      {/* Batch booking mode */}
      {batch.active && (
        <BatchBookingMode
          member={batch.member}
          onSelectMember={batch.setMember}
          stagedSlots={batch.stagedSlots}
          submitting={batch.submitting}
          onSubmit={async () => {
            const result = await batch.submit();
            if (result && result.success_count > 0) {
              showToast({ kind: 'ok', text: `Đã đặt ${result.success_count} buổi tập.` });
              batch.deactivate();
              await load(true);
            } else {
              showToast({ kind: 'err', text: 'Đặt lịch thất bại.' });
            }
          }}
          onCancel={batch.deactivate}
          customers={customers}
          data={data}
        />
      )}
    </div>
  );
}

function StatPill({ status, label }: { status: BookingStatus; label: string }) {
  const meta = bookingStatusMeta[status];
  const Icon = meta.Icon;
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium tabular-nums leading-relaxed', meta.pillClass, 'no-underline')}>
      <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      {label}
    </span>
  );
}
