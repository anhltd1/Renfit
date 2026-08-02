import { useCallback } from 'react';
import {
  cancelBooking,
  createBooking,
  fetchAvailability,
  type Availability,
  type CreateBookingResult,
} from '../../../lib/api/bookings';
import { useQueryState, type QueryState } from './useQuery';

/** Trainee's own booking calendar (U2 Shared Data Layer — wraps lib/api/bookings.ts). */
export function useBookingAvailability(customerId: string): QueryState<Availability> {
  return useQueryState(() => fetchAvailability(customerId), [customerId]);
}

export function useCreateBooking() {
  return useCallback(
    (customerId: string, time: string): Promise<CreateBookingResult> =>
      createBooking(customerId, time),
    [],
  );
}

export function useCancelBooking() {
  return useCallback(
    (customerId: string, bookingId: string): Promise<{ message: string }> =>
      cancelBooking(customerId, bookingId),
    [],
  );
}
