import { fetchAttendance, type AttendanceSummary } from '../../../lib/api/admin';
import { useQueryState, type QueryState } from './useQuery';

/**
 * Attendance summary for one customer (U22 Attendance, trainer-only):
 * `{ customer_id, completed, no_show }` from
 * `GET /api/v1/admin/customers/{id}/attendance`. Refetches when the id
 * changes; with no id it does not hit the network and `data` stays null.
 * Call `refetch(true)` after marking attendance to refresh silently.
 */
export function useAttendance(
  customerId: string | null | undefined,
): QueryState<AttendanceSummary | null> {
  return useQueryState<AttendanceSummary | null>(
    () => (customerId ? fetchAttendance(customerId) : Promise.resolve(null)),
    [customerId],
  );
}
