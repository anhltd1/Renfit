/**
 * Desktop dashboard "Đặt lịch tập" tab (U3 Trainee Desktop, TS-4).
 * Thin wrapper around the existing BookingCalendar component — per DL-3,
 * BookingCalendar keeps its own data-fetching/5s-poll rather than being
 * rewired to useBookingAvailability() here, to avoid a double-poll.
 */
import { useCallback, useEffect, useState } from 'react';
import { CalendarDays } from 'lucide-react';
import { BookingCalendar } from '../../components/BookingCalendar';
import { cancelBooking, createBooking, fetchAvailability, type Availability } from '../../../lib/api/bookings';
import type { AuthUser } from '../../../lib/auth';

export interface BookingTabProps {
  user: AuthUser;
}

export function BookingTab({ user }: BookingTabProps) {
  const [data, setData] = useState<Availability | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError('');
    try {
      setData(await fetchAvailability(user.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không tải được lịch.');
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const id = setInterval(() => load(true), 5000);
    return () => clearInterval(id);
  }, [load]);

  return (
    <div data-tour="booking-calendar" className="p-6 lg:p-8 flex flex-col gap-4 h-full">
      <div>
        <h2 className="text-white font-bold text-lg flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-[#0F6B3E]" /> Đặt Lịch Tập
        </h2>
      </div>
      <BookingCalendar
        customerId={user.id}
        data={data}
        loading={loading}
        error={error}
        onBook={async (slot) => {
          await createBooking(user.id, slot.time);
          await load(true);
        }}
        onCancel={async (slot) => {
          await cancelBooking(user.id, slot.my_booking_id ?? '');
          await load(true);
        }}
        onRefresh={() => load()}
      />
    </div>
  );
}
