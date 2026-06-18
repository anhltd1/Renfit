import { useCallback, useEffect, useState } from 'react';
import { Link } from '../components/Link';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import logoImage from '../../imports/image.png';
import { CalendarDays, Home, MessageSquare, User } from 'lucide-react';
import { getAuthUser } from '../../lib/auth';
import {
  cancelBooking,
  createBooking,
  fetchAvailability,
  type Availability,
} from '../../lib/api/bookings';
import { BookingCalendar } from '../components/BookingCalendar';

export function BookingPage() {
  const user = getAuthUser();
  const customerId = user?.id ?? '';

  const [data, setData] = useState<Availability | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      setError('');
      try {
        setData(await fetchAvailability(customerId));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Không tải được lịch.');
      } finally {
        setLoading(false);
      }
    },
    [customerId],
  );

  useEffect(() => { load(); }, [load]);

  return (
    <div className="min-h-screen bg-[#0B0B0B] flex flex-col">
      {/* Header */}
      <header className="bg-black/80 backdrop-blur-md border-b border-white/10 sticky top-0 z-20">
        <div className="max-w-[1300px] mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <ImageWithFallback src={logoImage} alt="Renfit" className="h-10 w-auto" />
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/dashboard" className="text-white/70 hover:text-[#0F6B3E] transition-colors flex items-center gap-2 px-4 py-2 rounded-full hover:bg-white/5">
              <Home className="w-4 h-4" /><span className="hidden sm:inline">Dashboard</span>
            </Link>
            <Link to="/ai-coach" className="text-white/70 hover:text-[#0F6B3E] transition-colors flex items-center gap-2 px-4 py-2 rounded-full hover:bg-white/5">
              <MessageSquare className="w-4 h-4" /><span className="hidden sm:inline">AI Coach</span>
            </Link>
            {user && (
              <Link to="/dashboard" className="flex items-center gap-2 text-white/70 hover:text-white text-sm">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.id} className="w-8 h-8 rounded-full object-cover border border-white/20" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#0F6B3E]/20 border border-[#0F6B3E]/30 flex items-center justify-center">
                    <User className="w-4 h-4 text-[#0F6B3E]" />
                  </div>
                )}
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-[1300px] w-full mx-auto px-6 py-8 flex flex-col">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <CalendarDays className="w-7 h-7 text-[#0F6B3E]" />
            Đặt Lịch Tập
          </h1>
          <p className="text-white/50 mt-1 text-sm">
            Chọn khung giờ trống để đặt lịch. Phòng gym mở 08:00–20:00, nghỉ Chủ Nhật.
          </p>
        </div>

        <BookingCalendar
          customerId={customerId}
          data={data}
          loading={loading}
          error={error}
          onBook={async (slot) => { await createBooking(customerId, slot.time); await load(true); }}
          onCancel={async (slot) => { await cancelBooking(customerId, slot.my_booking_id ?? ''); await load(true); }}
          onRefresh={() => load()}
        />
      </main>
    </div>
  );
}
