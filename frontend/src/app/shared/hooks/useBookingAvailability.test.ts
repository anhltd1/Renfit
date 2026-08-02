import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import * as bookingsApi from '../../../lib/api/bookings';
import { useBookingAvailability, useCreateBooking, useCancelBooking } from './useBookingAvailability';

afterEach(() => vi.restoreAllMocks());

describe('useBookingAvailability', () => {
  it('loads availability and exposes it once resolved', async () => {
    const availability = { capacity: 4, days: [] };
    vi.spyOn(bookingsApi, 'fetchAvailability').mockResolvedValue(availability as any);

    const { result } = renderHook(() => useBookingAvailability('cust-1'));
    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual(availability);
    expect(result.current.error).toBeNull();
  });

  it('surfaces the normalized error message on failure', async () => {
    vi.spyOn(bookingsApi, 'fetchAvailability').mockRejectedValue(new Error('Lỗi server.'));

    const { result } = renderHook(() => useBookingAvailability('cust-1'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe('Lỗi server.');
    expect(result.current.data).toBeNull();
  });

  it('refetch does not clear existing data before the new result arrives', async () => {
    const first = { capacity: 4, days: [{ date: '2026-07-20' }] };
    const second = { capacity: 4, days: [{ date: '2026-07-21' }] };
    const spy = vi
      .spyOn(bookingsApi, 'fetchAvailability')
      .mockResolvedValueOnce(first as any)
      .mockImplementationOnce(() => new Promise((resolve) => setTimeout(() => resolve(second as any), 20)));

    const { result } = renderHook(() => useBookingAvailability('cust-1'));
    await waitFor(() => expect(result.current.data).toEqual(first));

    act(() => {
      void result.current.refetch(true);
    });
    // Data should still be the first result while the silent refetch is in flight.
    expect(result.current.data).toEqual(first);

    await waitFor(() => expect(result.current.data).toEqual(second));
    expect(spy).toHaveBeenCalledTimes(2);
  });
});

describe('useCreateBooking / useCancelBooking', () => {
  it('useCreateBooking calls the underlying API with the given args', async () => {
    const spy = vi
      .spyOn(bookingsApi, 'createBooking')
      .mockResolvedValue({ success: true, booking_id: 'b1', time: '2026-07-20T08:00', status: 'pending', message: 'ok' });
    const { result } = renderHook(() => useCreateBooking());
    await act(async () => {
      await result.current('cust-1', '2026-07-20T08:00');
    });
    expect(spy).toHaveBeenCalledWith('cust-1', '2026-07-20T08:00');
  });

  it('useCancelBooking calls the underlying API with the given args', async () => {
    const spy = vi.spyOn(bookingsApi, 'cancelBooking').mockResolvedValue({ message: 'ok' });
    const { result } = renderHook(() => useCancelBooking());
    await act(async () => {
      await result.current('cust-1', 'b1');
    });
    expect(spy).toHaveBeenCalledWith('cust-1', 'b1');
  });
});
