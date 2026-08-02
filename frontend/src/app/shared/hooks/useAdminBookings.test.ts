import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import * as adminApi from '../../../lib/api/admin';
import { useAdminBookings, useUpdateBookingStatus, useAssignBooking, useCustomers } from './useAdminBookings';

beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }));
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('useAdminBookings', () => {
  it('loads bookings on mount', async () => {
    const data = { capacity: 4, days: [] };
    vi.spyOn(adminApi, 'fetchBookings').mockResolvedValue(data as any);
    const { result } = renderHook(() => useAdminBookings());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual(data);
  });

  it('polls every 5s, silently', async () => {
    const spy = vi.spyOn(adminApi, 'fetchBookings').mockResolvedValue({ capacity: 4, days: [] } as any);
    renderHook(() => useAdminBookings());
    await waitFor(() => expect(spy).toHaveBeenCalledTimes(1));

    await act(async () => {
      vi.advanceTimersByTime(5000);
    });
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('does not poll while paused', async () => {
    const spy = vi.spyOn(adminApi, 'fetchBookings').mockResolvedValue({ capacity: 4, days: [] } as any);
    const { result } = renderHook(() => useAdminBookings());
    await waitFor(() => expect(spy).toHaveBeenCalledTimes(1));

    act(() => result.current.setPaused(true));
    await act(async () => {
      vi.advanceTimersByTime(15000);
    });
    expect(spy).toHaveBeenCalledTimes(1);
  });
});

describe('useUpdateBookingStatus / useAssignBooking / useCustomers', () => {
  it('useUpdateBookingStatus delegates to the API', async () => {
    const spy = vi.spyOn(adminApi, 'updateBookingStatus').mockResolvedValue({ message: 'ok' });
    const { result } = renderHook(() => useUpdateBookingStatus());
    await act(async () => {
      await result.current('b1', 'approved');
    });
    expect(spy).toHaveBeenCalledWith('b1', 'approved');
  });

  it('useAssignBooking delegates to the API', async () => {
    const spy = vi.spyOn(adminApi, 'assignBooking').mockResolvedValue({ message: 'ok' });
    const { result } = renderHook(() => useAssignBooking());
    await act(async () => {
      await result.current('cust-1', '2026-07-20T08:00');
    });
    expect(spy).toHaveBeenCalledWith('cust-1', '2026-07-20T08:00', '');
  });

  it('useCustomers loads the customer list', async () => {
    vi.spyOn(adminApi, 'fetchCustomers').mockResolvedValue([{ id: 'cust-1' }] as any);
    const { result } = renderHook(() => useCustomers());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual([{ id: 'cust-1' }]);
  });
});
