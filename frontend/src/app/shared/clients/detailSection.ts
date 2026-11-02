import { useState } from 'react';
import { useInRouterContext } from 'react-router';
import {
  readParam,
  useInitialSearchParams,
  useSyncSearchParams,
} from '../hooks/useDashboardUrlState';

/**
 * Sections of the desktop member detail pane. Only one is shown at a time so
 * the pane stays calm instead of stacking notes + four charts in one scroll.
 */
export type DetailSection = 'inbody' | 'notes';

export const DETAIL_SECTIONS: readonly DetailSection[] = ['inbody', 'notes'];
export const DEFAULT_DETAIL_SECTION: DetailSection = 'inbody';

export const DETAIL_SECTION_LABELS: Record<DetailSection, string> = {
  inbody: 'Chỉ số InBody',
  notes: 'Ghi chú',
};

/** Router-backed: initial value from `?section=`, mirrored back (default omitted). */
function useRoutedDetailSection(): [DetailSection, (s: DetailSection) => void] {
  const initial = useInitialSearchParams();
  const [section, setSection] = useState<DetailSection>(() =>
    readParam(initial, 'section', DETAIL_SECTIONS, DEFAULT_DETAIL_SECTION),
  );
  useSyncSearchParams({ section: section === DEFAULT_DETAIL_SECTION ? null : section });
  return [section, setSection];
}

function useLocalDetailSection(): [DetailSection, (s: DetailSection) => void] {
  return useState<DetailSection>(DEFAULT_DETAIL_SECTION);
}

/**
 * Open section of the member detail pane. Survives a refresh via the `section`
 * URL key, and also survives switching member (the detail is remounted per
 * member and re-reads the URL). Outside a router (isolated component tests)
 * it degrades to plain state.
 */
export function useDetailSection(): [DetailSection, (s: DetailSection) => void] {
  const inRouter = useInRouterContext();
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return inRouter ? useRoutedDetailSection() : useLocalDetailSection();
}
