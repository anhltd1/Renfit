/**
 * useAdminToday — fetches today's sessions + pending bookings for the PT landing view.
 * U22: `data.sessions[]` carry the booking `id` and `status`
 * (approved | completed | no_show) and `data.unmarked_count` counts started,
 * still-approved sessions not yet marked (for the U23 "Hôm nay" hub).
 * Polls every 10s; pauses while the caller is performing an action.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchToday, type TodayData } from '../../../lib/api/admin';

export function useAdminToday() {
  const [data, setData] = useState<TodayData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const pausedRef = useRef(false);

  const load = useCallback(async (silent = false) => {
    if (!silent) {
      setLoading(true);
      setError('');
    }
    try {
      const next = await fetchToday();
      setData(next);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không tải được dữ liệu.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Poll every 10s unless paused
  useEffect(() => {
    const id = setInterval(() => {
      if (!pausedRef.current) load(true);
    }, 10_000);
    return () => clearInterval(id);
  }, [load]);

  const setPaused = useCallback((paused: boolean) => {
    pausedRef.current = paused;
  }, []);

  return { data, loading, error, refetch: load, setPaused };
}
