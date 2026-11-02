import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router';

/**
 * Keeps dashboard navigation (active tab, open member, sub-screen) in the URL
 * query string, e.g. `/admin/dashboard?tab=bookings`, so a page refresh lands
 * back on the same screen instead of the default one.
 *
 * - `useInitialSearchParams()` captures the params from the first render; the
 *   dashboards seed their `useState` from it.
 * - `useSyncSearchParams(values)` mirrors the current state back into the URL
 *   with `replace` (no history entry per tab tap — the mobile stack is
 *   deliberately not wired to the back button, see useStack.ts).
 *   `null`/`''` removes a key, so default screens keep a clean URL.
 */
export function useInitialSearchParams(): URLSearchParams {
  const [params] = useSearchParams();
  const initial = useRef(params);
  return initial.current;
}

/**
 * Read `key` from `params`, accepting only `allowed` values. `aliases` maps
 * the other device tree's keys (desktop "bookings" ↔ mobile "booking") so the
 * screen survives a desktop/mobile switch as well as a refresh.
 */
export function readParam<T extends string>(
  params: URLSearchParams,
  key: string,
  allowed: readonly T[],
  fallback: T,
  aliases: Partial<Record<string, T>> = {},
): T {
  const raw = params.get(key);
  if (!raw) return fallback;
  if ((allowed as readonly string[]).includes(raw)) return raw as T;
  return aliases[raw] ?? fallback;
}

/**
 * Registered dashboard URL keys (keep in sync with the dashboards' sync calls):
 *   tab     – active tab (default omitted)
 *   member  – open client detail
 *   day     – (U24) mobile Lịch đặt agenda day, "YYYY-MM-DD"; today = default, omitted
 *   filter  – (U24) client list filter; 'active' = default, omitted
 *   section – desktop member detail section (inbody | notes); 'inbody' = default, omitted
 */
export const DASHBOARD_URL_KEYS = ['tab', 'member', 'day', 'filter', 'section'] as const;

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Read a `YYYY-MM-DD` param; anything else (missing, malformed) → `fallback`. */
export function readDateParam(params: URLSearchParams, key: string, fallback: string): string {
  const raw = params.get(key);
  return raw && ISO_DATE.test(raw) && !Number.isNaN(Date.parse(raw)) ? raw : fallback;
}

export function useSyncSearchParams(values: Record<string, string | null | undefined>): void {
  const [params, setParams] = useSearchParams();
  const serialized = JSON.stringify(values);

  useEffect(() => {
    const next = new URLSearchParams(params);
    let changed = false;
    for (const [key, value] of Object.entries(values)) {
      const current = next.get(key);
      if (value == null || value === '') {
        if (current !== null) {
          next.delete(key);
          changed = true;
        }
      } else if (current !== value) {
        next.set(key, value);
        changed = true;
      }
    }
    if (changed) setParams(next, { replace: true });
    // `serialized` captures every value; params/setParams are read fresh.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serialized]);
}
