/**
 * useFreshness (U23) — tracks when a live screen last loaded successfully and
 * whether the latest refresh failed after a previous success (offline).
 */
import { useEffect, useRef, useState } from 'react';

export interface FreshnessInput {
  loading: boolean;
  error: string | boolean | null | undefined;
  data: unknown;
}

export function useFreshness({ loading, error, data }: FreshnessInput): {
  lastUpdatedAt: Date | null;
  offline: boolean;
} {
  const [lastUpdatedAt, setLast] = useState<Date | null>(null);
  const prevData = useRef<unknown>(null);

  useEffect(() => {
    if (data && data !== prevData.current && !error) {
      prevData.current = data;
      setLast(new Date());
    }
  }, [data, error]);

  // `loading` is part of the contract; silent refreshes keep it false.
  void loading;
  return { lastUpdatedAt, offline: !!error && lastUpdatedAt !== null };
}
