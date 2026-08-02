import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import * as bookingHooks from '../../shared/hooks/useBookingAvailability';
import { BookingScreen } from './BookingScreen';

afterEach(() => vi.restoreAllMocks());

const todayIso = new Date().toISOString().slice(0, 10);

const availability = {
  capacity: 4,
  days: [
    {
      date: todayIso,
      weekday: 1,
      label: 'Hôm nay',
      slots: [
        { hour: 8, time: `${todayIso}T08:00`, count: 1, remaining: 3, full: false, past: false, my_status: null, my_booking_id: null, available: true },
        { hour: 9, time: `${todayIso}T09:00`, count: 4, remaining: 0, full: true, past: false, my_status: null, my_booking_id: null, available: false },
      ],
    },
  ],
};

function mockHooks(overrides: Partial<ReturnType<typeof bookingHooks.useBookingAvailability>> = {}) {
  vi.spyOn(bookingHooks, 'useBookingAvailability').mockReturnValue({
    data: availability as any,
    loading: false,
    error: null,
    refetch: vi.fn(),
    ...overrides,
  });
  vi.spyOn(bookingHooks, 'useCreateBooking').mockReturnValue(vi.fn().mockResolvedValue({}));
  vi.spyOn(bookingHooks, 'useCancelBooking').mockReturnValue(vi.fn().mockResolvedValue({}));
}

describe('BookingScreen', () => {
  it('renders the day scroller and hour slots for the selected day', () => {
    mockHooks();
    render(<BookingScreen customerId="cust-1" />);
    expect(screen.getByTestId('booking-hour-list')).toBeInTheDocument();
    expect(screen.getByTestId('booking-slot-8')).toBeInTheDocument();
    expect(screen.getByTestId('booking-slot-9')).toBeInTheDocument();
  });

  it('disables a full slot that is not the trainee\'s own', () => {
    mockHooks();
    render(<BookingScreen customerId="cust-1" />);
    expect(screen.getByTestId('booking-slot-9')).toBeDisabled();
  });

  it('opens the confirm sheet and books on confirm', async () => {
    const createBooking = vi.fn().mockResolvedValue({});
    mockHooks();
    vi.spyOn(bookingHooks, 'useCreateBooking').mockReturnValue(createBooking);
    render(<BookingScreen customerId="cust-1" />);

    fireEvent.click(screen.getByTestId('booking-slot-8'));
    expect(screen.getByText('Xác nhận đặt lịch')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Đặt lịch'));
    await waitFor(() => expect(createBooking).toHaveBeenCalledWith('cust-1', `${todayIso}T08:00`));
  });

  it('shows an error message when the availability fetch fails', () => {
    mockHooks({ data: null, error: 'Không tải được lịch.' });
    render(<BookingScreen customerId="cust-1" />);
    expect(screen.getByText('Không tải được lịch.')).toBeInTheDocument();
  });
});
