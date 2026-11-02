/**
 * Mobile Lịch đặt — single-day agenda (U24, FR-5).
 *
 * Data: `useAdminBookings()` (GET /admin/bookings, silent 5 s polling, paused
 * while a sheet is open). Day scroller across the booking window (Sundays
 * "Nghỉ"); the selected day is owned by the page so it lives in the URL
 * (`day`, default today, omitted). Each hour 08–19 lists its bookings
 * (tap → status sheet with BookingStatusActions), the "n/4" occupancy,
 * blocked hours ("Đã chặn", not tappable) and an always-visible
 * "+ Đặt lịch" while capacity remains.
 */
import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Clock, Grid3x3, Loader2, Lock, Plus } from 'lucide-react';
import type { AdminBookingItem, AdminBookingSlot } from '../../../lib/api/admin';
import { useAdminBookings } from '../../shared/hooks/useAdminBookings';
import { useToast } from '../../shared/hooks/useToast';
import { useFreshness } from '../../shared/hooks/useFreshness';
import { FreshnessIndicator } from '../../shared/components/FreshnessIndicator';
import { StatusBadge } from '../../shared/booking/StatusBadge';
import { BookingStatusActions, useBookingStatusChange } from '../../shared/booking/BookingStatusActions';
import { bookingAccessibleName, isBookingStatusKey } from '../../shared/booking/statusMeta';
import { Sheet } from '../../shared/primitives/Sheet';
import { cn } from '../../shared/primitives/cn';
import { BlockOffManager } from '../../components/BlockOffManager';
import { CalendarKiosk } from '../../components/CalendarKiosk';
import { AdminDayScroller, buildScrollerDays, fmtDayMonth, weekdayOf } from '../components/AdminDayScroller';
import { AssignBookingSheet } from '../components/AssignBookingSheet';

const VIET_DAYS_FULL = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
const pad = (n: number) => String(n).padStart(2, '0');

/** Capacity-consuming bookings (completed / no_show keep their seat). */
export function occupiedCount(bookings: AdminBookingItem[]): number {
  return bookings.filter((b) => b.status !== 'rejected').length;
}

/** "+ Đặt lịch" is offered on unblocked hours with free capacity. */
export function canAssign(slot: AdminBookingSlot, capacity: number): boolean {
  return !slot.blocked && occupiedCount(slot.bookings) < capacity;
}

export interface AdminDayAgendaProps {
  /** Selected day, YYYY-MM-DD (owned by the page → URL key `day`). */
  day: string;
  /** Today in ICT, YYYY-MM-DD. */
  today: string;
  onDayChange: (day: string) => void;
  /** Switch to the 2-week grid (batch booking lives there). */
  onShowGrid: () => void;
  headerActions?: React.ReactNode;
}

interface SelectedBooking {
  booking: AdminBookingItem;
  time: string;
  hour: number;
}

export function AdminDayAgenda({ day, today, onDayChange, onShowGrid, headerActions }: AdminDayAgendaProps) {
  const { data, loading, error, refetch, setPaused } = useAdminBookings();
  const { show, node: toastNode } = useToast();
  const { lastUpdatedAt, offline } = useFreshness({ loading, error, data });
  const [selected, setSelected] = useState<SelectedBooking | null>(null);
  const [assigning, setAssigning] = useState<{ time: string; hour: number } | null>(null);
  const [blockOffOpen, setBlockOffOpen] = useState(false);
  const [kioskOpen, setKioskOpen] = useState(false);

  // Pause background polling while any overlay is open.
  const overlayOpen = !!selected || !!assigning || blockOffOpen || kioskOpen;
  useEffect(() => {
    setPaused(overlayOpen);
  }, [overlayOpen, setPaused]);

  const refreshSilently = () => refetch(true);
  const { change, pending: acting } = useBookingStatusChange({ show, refresh: refreshSilently });

  const scrollerDays = useMemo(() => buildScrollerDays(data?.days.map((d) => d.date) ?? []), [data]);
  const dayData = data?.days.find((d) => d.date === day) ?? null;
  const isSunday = weekdayOf(day) === 0;

  // A stale `?day=` outside the window falls back to today (or the first day).
  useEffect(() => {
    if (!data || data.days.length === 0) return;
    const inWindow = scrollerDays.some((d) => d.date === day);
    if (!inWindow) {
      const fallback = data.days.find((d) => d.date >= today)?.date ?? data.days[0].date;
      if (fallback !== day) onDayChange(fallback);
    }
  }, [data, scrollerDays, day, today, onDayChange]);

  const pendingCount = useMemo(
    () =>
      data?.days.reduce(
        (n, d) => n + d.slots.reduce((m, s) => m + s.bookings.filter((b) => b.status === 'pending').length, 0),
        0,
      ) ?? 0,
    [data],
  );

  const capacity = data?.capacity ?? 0;
  const title = `${VIET_DAYS_FULL[weekdayOf(day)]} · ${fmtDayMonth(day)}`;

  const headerBtn =
    'tap-target inline-flex items-center gap-1.5 px-3 rounded-full border border-white/10 text-sm text-white/80 bg-white/5 active:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3DBE7A]';

  return (
    <div className="ops-surface flex flex-col h-full min-h-0 overflow-hidden" data-testid="admin-day-agenda">
      {/* Header */}
      <header
        className="app-chrome shrink-0 bg-black border-b border-white/10 px-4 pb-2"
        style={{ paddingTop: 'max(0.5rem, env(safe-area-inset-top))' }}
      >
        <div className="min-h-12 flex items-center gap-2">
          <h1 className="flex-1 min-w-0 truncate text-white font-bold leading-relaxed tabular-nums" data-testid="agenda-title">
            {day === today ? `Hôm nay · ${fmtDayMonth(day)}` : title}
          </h1>
          {headerActions}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span
            data-testid="agenda-pending-count"
            className={cn(
              'inline-flex items-center gap-1 px-3 py-1 rounded-full border text-sm tabular-nums leading-relaxed',
              pendingCount > 0 ? 'border-[#f59e0b]/50 bg-[#f59e0b]/10 text-[#f59e0b]' : 'border-white/10 text-white/60',
            )}
          >
            <Clock className="w-3.5 h-3.5" aria-hidden="true" />
            Chờ duyệt: {pendingCount}
          </span>
          <FreshnessIndicator lastUpdatedAt={lastUpdatedAt} offline={offline} />
        </div>
        <div className="mt-2 flex gap-2 overflow-x-auto [scrollbar-width:none]">
          <button type="button" className={headerBtn} onClick={() => setBlockOffOpen(true)} data-testid="agenda-block-off">
            <Lock className="w-4 h-4" aria-hidden="true" /> Chặn giờ
          </button>
          <button type="button" className={headerBtn} onClick={() => setKioskOpen(true)} data-testid="agenda-kiosk">
            <CalendarDays className="w-4 h-4" aria-hidden="true" /> Lịch để bàn
          </button>
          <button type="button" className={headerBtn} onClick={onShowGrid} data-testid="agenda-show-grid">
            <Grid3x3 className="w-4 h-4" aria-hidden="true" /> Lưới 2 tuần
          </button>
        </div>
      </header>

      {scrollerDays.length > 0 && (
        <div className="shrink-0 border-b border-white/10 bg-black">
          <AdminDayScroller days={scrollerDays} selected={day} today={today} onSelect={onDayChange} />
        </div>
      )}

      {/* Hour list */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain">
        {loading && !data ? (
          <div className="flex flex-col items-center justify-center py-20 text-white/60 gap-3">
            <Loader2 className="w-6 h-6 animate-spin" aria-hidden="true" />
            <p className="text-sm">Đang tải...</p>
          </div>
        ) : error && !data ? (
          <p className="m-4 rounded-2xl border border-error-text/30 bg-[#f87171]/10 px-4 py-3 text-sm text-error-text">{error}</p>
        ) : isSunday ? (
          <div className="flex flex-col items-center justify-center py-20 gap-2 text-white/60" data-testid="agenda-sunday">
            <p className="text-base font-semibold text-white/80">Chủ Nhật — phòng tập nghỉ</p>
            <p className="text-sm">Chọn ngày khác để xem lịch.</p>
          </div>
        ) : !dayData ? (
          <p className="text-white/60 text-sm text-center py-20">Không có lịch cho ngày này.</p>
        ) : (
          <ul className="divide-y divide-white/8" aria-label={`Lịch ${title}`}>
            {dayData.slots.map((slot) => {
              const occupied = occupiedCount(slot.bookings);
              const blocked = !!slot.blocked;
              return (
                <li
                  key={slot.hour}
                  data-testid={`agenda-hour-${slot.hour}`}
                  className={cn('flex gap-3 px-4 py-3', blocked && 'relative')}
                  style={
                    blocked
                      ? { background: 'repeating-linear-gradient(-45deg, transparent 0 6px, rgba(248,113,113,0.07) 6px 7px)' }
                      : undefined
                  }
                >
                  <div className="w-14 shrink-0 pt-1">
                    <p className="text-white font-semibold text-sm tabular-nums">{pad(slot.hour)}:00</p>
                    {!blocked && (
                      <p className="text-white/60 text-xs tabular-nums" data-testid={`agenda-count-${slot.hour}`}>
                        {occupied}/{capacity}
                      </p>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                    {blocked ? (
                      <span
                        data-testid={`agenda-blocked-${slot.hour}`}
                        className="self-start inline-flex items-center gap-1 mt-1 px-3 py-1 rounded-full border border-error-text/30 bg-[#f87171]/10 text-error-text text-xs font-semibold"
                      >
                        <Lock className="w-3 h-3" aria-hidden="true" /> Đã chặn
                      </span>
                    ) : (
                      <>
                        {slot.bookings.map((b) => (
                          <button
                            key={b.id}
                            type="button"
                            data-testid={`agenda-booking-${b.id}`}
                            onClick={() => setSelected({ booking: b, time: slot.time, hour: slot.hour })}
                            aria-label={bookingAccessibleName({ customer_id: b.customer_id, time: slot.time, status: b.status })}
                            className="w-full min-h-11 flex items-center gap-2 px-3 py-2 rounded-xl border border-white/10 bg-white/[0.03] active:bg-white/10 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3DBE7A]"
                          >
                            <StatusBadge status={b.status} />
                            <span
                              className={cn(
                                'flex-1 min-w-0 truncate text-sm font-medium',
                                b.status === 'rejected' ? 'text-white/60 line-through' : 'text-white',
                              )}
                            >
                              {b.customer_id}
                            </span>
                          </button>
                        ))}
                        {canAssign(slot, capacity) && (
                          <button
                            type="button"
                            data-testid={`agenda-assign-${slot.hour}`}
                            onClick={() => setAssigning({ time: slot.time, hour: slot.hour })}
                            aria-label={`Đặt lịch lúc ${pad(slot.hour)}:00 ${fmtDayMonth(day)}`}
                            className="tap-target self-start inline-flex items-center gap-1 px-3 rounded-full border border-dashed border-primary-text/40 text-primary-text text-sm font-semibold active:bg-[#0F6B3E]/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3DBE7A]"
                          >
                            <Plus className="w-4 h-4" aria-hidden="true" /> Đặt lịch
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Status sheet */}
      <Sheet open={!!selected} onClose={() => setSelected(null)} title="Cập nhật lịch đặt" ops>
        {selected && (
          <div className="flex flex-col gap-4" data-testid="agenda-status-sheet">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 leading-relaxed">
              <p className="text-white font-semibold text-base">{selected.booking.customer_id}</p>
              <p className="text-white/70 text-sm tabular-nums">
                {title} · {pad(selected.hour)}:00 – {pad(selected.hour + 1)}:00
              </p>
              <StatusBadge status={selected.booking.status} size="md" className="mt-2" />
            </div>
            {isBookingStatusKey(selected.booking.status) && (
              <BookingStatusActions
                booking={{
                  id: selected.booking.id,
                  customer_id: selected.booking.customer_id,
                  time: selected.time,
                  status: selected.booking.status,
                }}
                busy={acting}
                onChange={async (next, prev) => {
                  const ok = await change(selected.booking, next, prev);
                  if (ok) setSelected(null);
                }}
              />
            )}
          </div>
        )}
      </Sheet>

      {assigning && (
        <AssignBookingSheet
          open
          date={day}
          time={assigning.time}
          hour={assigning.hour}
          onClose={() => setAssigning(null)}
          onAssigned={() => {
            setAssigning(null);
            void refetch(true);
          }}
          showToast={show}
        />
      )}

      {blockOffOpen && (
        <BlockOffManager
          date={day}
          onClose={() => setBlockOffOpen(false)}
          onDone={() => {
            setBlockOffOpen(false);
            void refetch(true);
          }}
        />
      )}

      {kioskOpen && <CalendarKiosk onClose={() => { setKioskOpen(false); void refetch(true); }} />}

      {toastNode}
    </div>
  );
}
