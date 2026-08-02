/**
 * Mobile booking screen (U4 Trainee Mobile, TS-3, BOOK-1/BOOK-2/BOOK-3).
 * Single screen: day-scroller + hour list + a Sheet for book/cancel
 * confirmation — no stack push, per the approved 2-tap flow.
 */
import { useState } from 'react';
import { CalendarCheck, Clock } from 'lucide-react';
import { useBookingAvailability, useCreateBooking, useCancelBooking } from '../../shared/hooks/useBookingAvailability';
import { Sheet } from '../../shared/primitives/Sheet';
import { Button } from '../../shared/primitives/Button';
import { Toast } from '../../shared/primitives/Toast';
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
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading && !data ? (
          <p className="text-white/40 text-sm text-center py-8">Đang tải lịch...</p>
        ) : error ? (
          <p className="text-red-300 text-sm bg-red-400/10 border border-red-400/25 rounded-xl px-4 py-3">{error}</p>
        ) : (
          <>
            <DayScroller days={days} selected={selectedDate} onSelect={setSelectedDate} />
            <div className="space-y-2" data-testid="booking-hour-list">
              {selectedDay?.slots.map((slot) => {
                const isMine = slot.my_status === 'pending' || slot.my_status === 'approved';
                return (
                  <button
                    key={slot.hour}
                    type="button"
                    data-testid={`booking-slot-${slot.hour}`}
                    disabled={slot.past || (slot.full && !isMine)}
                    onClick={() => setPending({ slot, mode: isMine ? 'cancel' : 'book' })}
                    className="w-full flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left disabled:opacity-30 transition-all hover:border-[#0F6B3E]/40"
                  >
                    <span className="flex items-center gap-2 text-white text-sm font-medium">
                      <Clock className="w-4 h-4 text-white/40" />
                      {String(slot.hour).padStart(2, '0')}:00
                    </span>
                    <span className="text-xs font-semibold">
                      {isMine ? (
                        <span className={slot.my_status === 'approved' ? 'text-[#0F6B3E]' : 'text-white/70'}>
                          {slot.my_status === 'approved' ? '✓ Đã duyệt' : '⏳ Chờ duyệt'}
                        </span>
                      ) : slot.full ? (
                        <span className="text-white/30">Đã đầy</span>
                      ) : slot.past ? (
                        <span className="text-white/20">—</span>
                      ) : (
                        <span className="text-[#0F6B3E]">Còn {slot.remaining} chỗ</span>
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
            <div className="bg-[#0F6B3E]/10 border border-[#0F6B3E]/25 rounded-xl p-4 flex items-center gap-3">
              <CalendarCheck className="w-5 h-5 text-[#0F6B3E] shrink-0" />
              <p className="text-white text-sm">
                {String(pending.slot.hour).padStart(2, '0')}:00 – {String(pending.slot.hour + 1).padStart(2, '0')}:00
              </p>
            </div>
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
