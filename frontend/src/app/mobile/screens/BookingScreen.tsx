/**
 * Mobile booking screen (U4 Trainee Mobile, TS-3, BOOK-1/BOOK-2/BOOK-3).
 * Single screen: day-scroller + hour list + a Sheet for book/cancel
 * confirmation — no stack push, per the approved 2-tap flow.
 */
import { useState } from 'react';
import { CapacityMarks } from '../../shared/booking/CapacityMarks';
import { dayLabel } from '../../shared/member/memberHomeModel';
import { useBookingAvailability, useCreateBooking, useCancelBooking } from '../../shared/hooks/useBookingAvailability';
import { Sheet } from '../../shared/primitives/Sheet';
import { Button } from '../../shared/primitives/Button';
import { Toast } from '../../shared/primitives/Toast';
import { StatusBadge } from '../../shared/booking/StatusBadge';
import { DayScroller } from '../components/DayScroller';
import { StackHeader } from '../shell/StackHeader';
import type { Slot } from '../../../lib/api/bookings';

export interface BookingScreenProps {
  customerId: string;
}

interface PendingAction {
  slot: Slot;
  mode: 'book' | 'cancel';
}

export function BookingScreen({ customerId }: BookingScreenProps) {
  const { data, loading, error, refetch } = useBookingAvailability(customerId);
  const createBooking = useCreateBooking();
  const cancelBooking = useCancelBooking();

  const todayIso = new Date().toISOString().slice(0, 10);
  const [selectedDate, setSelectedDate] = useState(todayIso);
  const [pending, setPending] = useState<PendingAction | null>(null);
  const [acting, setActing] = useState(false);
  const [toast, setToast] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  const days = data?.days ?? [];
  const selectedDay = days.find((d) => d.date === selectedDate) ?? days[0];

  const confirm = async () => {
    if (!pending) return;
    setActing(true);
    try {
      if (pending.mode === 'book') {
        await createBooking(customerId, pending.slot.time);
        setToast({ kind: 'ok', text: 'Đặt lịch thành công! Chờ HLV xác nhận.' });
      } else {
        await cancelBooking(customerId, pending.slot.my_booking_id ?? '');
        setToast({ kind: 'ok', text: 'Đã hủy lịch đặt.' });
      }
      setPending(null);
      await refetch(true);
    } catch (err) {
      setToast({ kind: 'err', text: err instanceof Error ? err.message : 'Thao tác thất bại.' });
    } finally {
      setActing(false);
    }
  };

  return (
    <div className="flex flex-col min-h-0 flex-1">
      <StackHeader title="Đặt lịch tập" />
      <div className="flex-1 overflow-y-auto overscroll-y-contain p-4 space-y-4">
        {loading && !data ? (
          <p className="text-white/64 text-sm text-center py-8">Đang tải lịch...</p>
        ) : error ? (
          <p className="text-error-text text-sm bg-[#f87171]/[0.06] border border-error-text/30 rounded-control px-4 py-3">{error}</p>
        ) : (
          <>
            <DayScroller days={days} selected={selectedDate} onSelect={setSelectedDate} />
            <div className="bg-surface border border-line rounded-panel divide-y divide-line overflow-hidden" data-testid="booking-hour-list">
              {selectedDay?.slots.map((slot) => {
                const isMine = slot.my_status === 'pending' || slot.my_status === 'approved';
                // U22: attended / missed sessions are read-only (no cancel).
                const attendance = slot.my_status === 'completed' || slot.my_status === 'no_show' ? slot.my_status : null;
                if (attendance) {
                  return (
                    <div
                      key={slot.hour}
                      data-testid={`booking-slot-${slot.hour}`}
                      className="w-full flex items-center justify-between px-4 min-h-14"
                    >
                      <span className="text-white/64 text-base font-semibold tabular-nums">
                        {String(slot.hour).padStart(2, '0')}:00
                      </span>
                      <StatusBadge status={attendance} />
                    </div>
                  );
                }
                return (
                  <button
                    key={slot.hour}
                    type="button"
                    data-testid={`booking-slot-${slot.hour}`}
                    disabled={slot.past || (slot.full && !isMine)}
                    onClick={() => setPending({ slot, mode: isMine ? 'cancel' : 'book' })}
                    className={`w-full flex items-center gap-3 px-4 min-h-14 text-left transition-colors active:bg-surface-2 disabled:active:bg-transparent ${isMine ? 'bg-primary-tint' : ''}`}
                  >
                    <span className={`text-base font-semibold tabular-nums w-14 ${slot.past ? 'text-white/40' : 'text-white'}`}>
                      {String(slot.hour).padStart(2, '0')}:00
                    </span>
                    <span className="flex-1 flex items-center">
                      {!slot.past && <CapacityMarks taken={slot.count} capacity={data?.capacity ?? 4} mine={isMine} />}
                    </span>
                    <span className="text-sm">
                      {isMine ? (
                        <StatusBadge status={slot.my_status as string} />
                      ) : slot.past ? (
                        <span className="text-white/40">Đã qua</span>
                      ) : slot.full ? (
                        <span className="text-white/64">Hết chỗ</span>
                      ) : (
                        <span className="text-white/80 tabular-nums">Còn {slot.remaining} chỗ</span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      <Sheet
        open={!!pending}
        onClose={() => setPending(null)}
        title={pending?.mode === 'book' ? 'Xác nhận đặt lịch' : 'Hủy lịch đặt'}
      >
        {pending && (
          <div className="space-y-4">
            <div className="border border-line rounded-control bg-surface-2 p-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-white text-2xl font-semibold tabular-nums leading-tight">
                  {String(pending.slot.hour).padStart(2, '0')}:00 – {String(pending.slot.hour + 1).padStart(2, '0')}:00
                </p>
                {selectedDay && <p className="text-white/64 text-sm mt-1">{dayLabel(selectedDay.date)}</p>}
              </div>
              <CapacityMarks taken={pending.slot.count} capacity={data?.capacity ?? 4} mine={pending.mode === 'cancel'} showLabel labelStyle="remaining" />
            </div>
            <p className="text-white/64 text-sm leading-relaxed">
              {pending.mode === 'book'
                ? 'Lịch sẽ ở trạng thái "Chờ duyệt" cho đến khi huấn luyện viên xác nhận.'
                : 'Khung giờ sẽ được mở lại cho người khác.'}
            </p>
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setPending(null)}>
                Quay lại
              </Button>
              <Button
                variant={pending.mode === 'book' ? 'primary' : 'danger'}
                className="flex-1"
                loading={acting}
                onClick={confirm}
              >
                {pending.mode === 'book' ? 'Đặt lịch' : 'Hủy lịch'}
              </Button>
            </div>
          </div>
        )}
      </Sheet>

      {toast && <Toast kind={toast.kind} text={toast.text} />}
    </div>
  );
}
