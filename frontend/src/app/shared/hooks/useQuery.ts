import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Internal query-state helper (U2 Shared Data Layer).
 *
 * Formalizes the loading/success/error pattern already used ad hoc across
 * the codebase (BookingCalendar.tsx, AdminBookings.tsx) into one reusable
 * primitive that every read hook in this folder builds on. Not exported
 * from the barrel — it's plumbing, not part of the public hook API.
 *
 * Rules (see .kiro/aidlc-docs/construction/U2-shared-data-layer/functional-design/business-rules.md):
 *  - DR-2: `error` is passed through as-is (lib/api already normalizes to Vietnamese).
 *  - DR-3: refetch never clears `data` first — no flash-to-empty.
 */

export interface QueryState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  /** Re-run the fetcher. `silent=true` (default for background polls) keeps stale data visible. */
  refetch: (silent?: boolean) => Promise<void>;
}

export function useQueryState<T>(
  fetcher: () => Promise<T>,
  deps: React.DependencyList,
): QueryState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const run = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const result = await fetcherRef.current();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi server. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps -- deps are caller-supplied by design
  useEffect(() => {
    run(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error, refetch: run };
}

/**
 * Poll a fetcher on an interval, silently (no loading flicker), optionally
 * pausable via `pausedRef` (e.g. while a confirm modal/sheet is open — see
 * DR-4). Intended to be layered on top of `useQueryState`'s `refetch`.
 */
export function usePolling(
  refetch: (silent?: boolean) => Promise<void>,
  intervalMs: number,
  pausedRef?: { current: boolean },
) {
  useEffect(() => {
    const id = setInterval(() => {
      if (pausedRef?.current) return;
      void refetch(true);
    }, intervalMs);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intervalMs]);
}
