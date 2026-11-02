const API_BASE = import.meta.env.VITE_API_URL ?? '';

function url(path: string) {
  return API_BASE ? `${API_BASE}${path}` : path;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { detail?: unknown };
    if (typeof err.detail === 'string') throw new Error(err.detail);
    if (Array.isArray(err.detail)) {
      const first = err.detail[0] as { msg?: string } | undefined;
      throw new Error(first?.msg ?? 'Dữ liệu không hợp lệ.');
    }
    throw new Error('Lỗi server. Vui lòng thử lại.');
  }
  return res.json();
}

export type BookingStatus = 'pending' | 'approved' | 'rejected' | 'completed' | 'no_show';

export interface Slot {
  hour: number;
  time: string;
  count: number;
  remaining: number;
  full: boolean;
  past: boolean;
  my_status: BookingStatus | null;
  my_booking_id: string | null;
  available: boolean;
}

export interface DayAvailability {
  date: string;
  weekday: number;
  label: string;
  slots: Slot[];
}

export interface Availability {
  capacity: number;
  days: DayAvailability[];
}

export async function fetchAvailability(customerId: string): Promise<Availability> {
  const res = await fetch(
    url(`/api/v1/bookings/availability?customer_id=${encodeURIComponent(customerId)}`),
  );
  return handleResponse<Availability>(res);
}

export interface CreateBookingResult {
  success: boolean;
  booking_id: string;
  time: string;
  status: BookingStatus;
  message: string;
}

export async function createBooking(
  customerId: string,
  time: string,
): Promise<CreateBookingResult> {
  const res = await fetch(url('/api/v1/bookings'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ customer_id: customerId, time }),
  });
  return handleResponse(res);
}

export async function cancelBooking(
  customerId: string,
  bookingId: string,
): Promise<{ message: string }> {
  const res = await fetch(url('/api/v1/bookings/cancel'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ customer_id: customerId, booking_id: bookingId }),
  });
  return handleResponse(res);
}
