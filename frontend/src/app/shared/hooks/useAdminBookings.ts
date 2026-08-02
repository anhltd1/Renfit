import { useCallback, useRef } from 'react';
import {
  assignBooking,
  fetchBookings,
  fetchCustomers,
  updateBookingStatus,
  type AdminBookings,
  type BookingStatus,
  type CustomerSummary,
} from '../../../lib/api/admin';
import { useQueryState, usePolling, type QueryState } from './useQuery';

const POLL_INTERVAL_MS = 5000;

/**
 * Trainer's booking calendar (U2 Shared Data Layer — wraps lib/api/admin.ts).
 * Polls every 5s like the current AdminBookings.tsx; call `setPaused(true)`
 * while a confirm/assign dialog is open so a background refresh can't pull
 * the rug out from under it (DR-4), matching the existing `selectedRef` guard.
 */
export function useAdminBookings(): QueryState<AdminBookings> & { setPaused: (paused: boolean) => void } {
  const query = useQueryState(() => fetchBookings(), []);
  const pausedRef = useRef(false);
  usePolling(query.refetch, POLL_INTERVAL_MS, pausedRef);

  const setPaused = useCallback((paused: boolean) => {
    pausedRef.current = paused;
  }, []);

  return { ...query, setPaused };
}

export function useUpdateBookingStatus() {
  return useCallback(
    (bookingId: string, status: BookingStatus) => updateBookingStatus(bookingId, status),
    [],
  );
}

export function useAssignBooking() {
  return useCallback(
    (customerId: string, time: string, note = '') => assignBooking(customerId, time, note),
    [],
  );
}

export function useCustomers(): QueryState<CustomerSummary[]> {
  return useQueryState(() => fetchCustomers(), []);
}
