import { useState } from 'react';
import { useInRouterContext } from 'react-router';
import {
  readParam,
  useInitialSearchParams,
  useSyncSearchParams,
} from '../hooks/useDashboardUrlState';
import { CLIENT_FILTERS, DEFAULT_CLIENT_FILTER, type ClientFilter } from './clientFilters';

/** Router-backed: initial value from `?filter=`, mirrored back (default omitted). */
function useRoutedClientFilter(): [ClientFilter, (f: ClientFilter) => void] {
  const initial = useInitialSearchParams();
  const [filter, setFilter] = useState<ClientFilter>(() =>
    readParam(initial, 'filter', CLIENT_FILTERS, DEFAULT_CLIENT_FILTER),
  );
  useSyncSearchParams({ filter: filter === DEFAULT_CLIENT_FILTER ? null : filter });
  return [filter, setFilter];
}

function useLocalClientFilter(): [ClientFilter, (f: ClientFilter) => void] {
  return useState<ClientFilter>(DEFAULT_CLIENT_FILTER);
}

/**
 * Client list filter that survives a refresh via the `filter` URL key (U24,
 * NFR-4). Outside a router (isolated component tests) it degrades to plain
 * state. Router presence never changes during a component's lifetime, so the
 * hook order is stable.
 */
export function useClientFilter(): [ClientFilter, (f: ClientFilter) => void] {
  const inRouter = useInRouterContext();
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return inRouter ? useRoutedClientFilter() : useLocalClientFilter();
}
