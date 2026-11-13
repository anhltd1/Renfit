import { useCallback, useEffect, useState } from 'react';
import { fetchAvailability, type Availability } from '../../../lib/api/bookings';
import { fetchMyInbody, type InbodyRecordOut } from '../../../lib/api/profile';

/**
 * Loads what the member home needs (availability + InBody history) for both
 * device trees. A failed load keeps whatever loaded last and sets `error`, so
 * the screen can say so instead of silently showing an empty state.
 */
export function useMemberHome(customerId: string) {
  const [availability, setAvailability] = useState<Availability | null>(null);
  const [records, setRecords] = useState<InbodyRecordOut[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setError(false);
    try {
      const [avail, inbody] = await Promise.all([fetchAvailability(customerId), fetchMyInbody(customerId)]);
      setAvailability(avail);
      setRecords(inbody ?? []);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  useEffect(() => {
    load();
  }, [load]);

  return { availability, records, loading, error, reload: load };
}
