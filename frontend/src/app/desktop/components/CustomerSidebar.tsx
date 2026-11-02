/**
 * Desktop admin customer sidebar (U5 Trainer Desktop, DL-1/DL-4).
 * Always visible (no hidden md:flex / isMobile branching — device selection
 * already happened at the route entry).
 *
 * Calm layout: ONE search row (with a compact "+" to create a member) and ONE
 * controls row (filter + sort as selects) instead of wrapped chips and pills.
 * Filter (`?filter=`) and sort logic come from `shared/clients` so mobile
 * behaves identically.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronDown, Plus, Search, Users } from 'lucide-react';
import type { CustomerSummary } from '../../../lib/api/admin';
import { SidebarRow } from './SidebarRow';
import { matchesQuery } from '../../shared/text/normalizeVi';
import {
  CLIENT_FILTERS,
  CLIENT_FILTER_LABELS,
  DEFAULT_CLIENT_FILTER,
  SORT_OPTIONS,
  filterClients,
  sortClients,
  type ClientFilter,
  type SortMode,
} from '../../shared/clients/clientFilters';
import { useClientFilter } from '../../shared/clients/useClientFilter';

export interface CustomerSidebarProps {
  customers: CustomerSummary[];
  selectedId: string | null;
  search: string;
  onSearchChange: (v: string) => void;
  onSelect: (customer: CustomerSummary) => void;
  loading: boolean;
  error: string;
  onCreateMember?: () => void;
}

function SelectBox({
  label,
  value,
  onChange,
  options,
  testId,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly { value: string; label: string }[];
  testId: string;
}) {
  return (
    <label className="relative flex-1 min-w-0">
      <span className="sr-only">{label}</span>
      <select
        data-testid={testId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="tap-target w-full appearance-none bg-white/5 border border-white/10 hover:border-white/20 focus:border-[#3DBE7A] rounded-xl pl-3 pr-8 py-1.5 text-sm text-white truncate outline-none cursor-pointer transition-colors"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-[#111] text-white">
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown
        className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60 pointer-events-none"
        aria-hidden="true"
      />
    </label>
  );
}

const FILTER_OPTIONS = CLIENT_FILTERS.map((key) => ({ value: key, label: CLIENT_FILTER_LABELS[key] }));
const SORT_SELECT_OPTIONS = SORT_OPTIONS.map(({ key, label }) => ({ value: key, label: `Xếp: ${label}` }));

export function CustomerSidebar({
  customers,
  selectedId,
  search,
  onSearchChange,
  onSelect,
  loading,
  error,
  onCreateMember,
}: CustomerSidebarProps) {
  const [sort, setSort] = useState<SortMode>('alpha');
  const [filter, setFilter] = useClientFilter();
  const searchRef = useRef<HTMLInputElement>(null);

  // Accent/case-insensitive Vietnamese match ("nguyen" finds "Nguyễn"),
  // filter first, then search, then sort.
  const filtered = sortClients(
    filterClients(customers, filter).filter((c) => matchesQuery([c.id, c.phone_number, c.goal], search)),
    sort,
  );
  const hasConstraint = !!search || filter !== DEFAULT_CLIENT_FILTER || filtered.length !== customers.length;

  // Keyboard navigation: "/" focuses search.
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
      e.preventDefault();
      searchRef.current?.focus();
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <aside className="w-72 lg:w-80 shrink-0 flex flex-col border-r border-white/8 bg-[#0B0B0B]">
      <div className="p-3 space-y-2 border-b border-white/6">
        <div className="flex items-center gap-2">
          <div className="relative flex-1 min-w-0">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60 pointer-events-none"
              aria-hidden="true"
            />
            <input
              ref={searchRef}
              type="text"
              data-testid="input-customer-search"
              aria-label="Tìm hội viên"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Tìm hội viên  ( / )"
              className="w-full bg-white/5 border border-white/10 focus:border-[#3DBE7A] rounded-xl pl-9 pr-3 py-2 text-white placeholder:text-white/40 outline-none transition-colors text-sm"
            />
          </div>
          {onCreateMember && (
            <button
              type="button"
              data-testid="button-create-member"
              onClick={onCreateMember}
              title="Tạo hội viên"
              aria-label="Tạo hội viên"
              className="tap-target shrink-0 inline-flex items-center justify-center rounded-xl bg-[#0F6B3E] hover:bg-[#0F6B3E]/80 active:scale-[0.96] text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3DBE7A]"
              style={{ width: 40, height: 40 }}
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <SelectBox
            label="Lọc hội viên"
            testId="select-client-filter"
            value={filter}
            onChange={(v) => setFilter(v as ClientFilter)}
            options={FILTER_OPTIONS}
          />
          <SelectBox
            label="Sắp xếp hội viên"
            testId="select-client-sort"
            value={sort}
            onChange={(v) => setSort(v as SortMode)}
            options={SORT_SELECT_OPTIONS}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {loading && (
          <div className="space-y-1 p-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2.5">
                <div className="w-9 h-9 rounded-full bg-white/[0.06] animate-pulse shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-24 bg-white/[0.06] rounded animate-pulse" />
                  <div className="h-2.5 w-16 bg-white/[0.04] rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        )}
        {!loading && error && (
          <p className="text-error-text text-sm p-4 bg-[#f87171]/10 rounded-xl m-2">{error}</p>
        )}
        {!loading && !error && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-white/60 gap-2">
            <Users className="w-7 h-7" aria-hidden="true" />
            <p className="text-sm font-medium">{hasConstraint ? 'Không tìm thấy hội viên.' : 'Chưa có hội viên nào.'}</p>
          </div>
        )}
        {!loading &&
          !error &&
          filtered.map((c, i) => (
            <div key={c.id} className="animate-fade-up" style={{ '--stagger': Math.min(i, 7) } as React.CSSProperties}>
              <SidebarRow customer={c} selected={selectedId === c.id} onClick={() => onSelect(c)} />
            </div>
          ))}
      </div>

      {!loading && filtered.length > 0 && (
        <div className="px-4 py-2.5 border-t border-white/6">
          <p className="text-white/60 text-xs tabular-nums">
            {hasConstraint ? `${filtered.length} / ${customers.length} hội viên` : `${customers.length} hội viên`}
          </p>
        </div>
      )}
    </aside>
  );
}
