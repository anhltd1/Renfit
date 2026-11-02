/**
 * Trainer mobile customer-list screen (U6 Trainer Mobile, TR-2, TR-6).
 * Root of the "Hội viên" tab: search + filter chips + sort + scrollable list.
 *
 * U24 (FR-4/FR-10): header actions (bell + overflow menu with refresh /
 * tablet mode / logout) come from the page as `headerActions`, shared by
 * every mobile PT tab. Filter chips (`?filter=`) and sort options are the
 * same as the desktop sidebar (`shared/clients`); archived rows show an
 * "Đã nghỉ" marker. Pull-to-refresh still calls `onRefresh`.
 */
import React, { useState } from 'react';
import { Archive, Phone, Plus, User, Users } from 'lucide-react';
import type { CustomerSummary } from '../../../lib/api/admin';
import { StackHeader } from '../shell/StackHeader';
import { PullToRefresh } from '../../shared/primitives/PullToRefresh';
import { matchesQuery } from '../../shared/text/normalizeVi';
import {
  DEFAULT_CLIENT_FILTER,
  SORT_OPTIONS,
  filterClients,
  isActiveClient,
  sortClients,
  type SortMode,
} from '../../shared/clients/clientFilters';
import { ClientFilterChips } from '../../shared/clients/ClientFilterChips';
import { useClientFilter } from '../../shared/clients/useClientFilter';
import { cn } from '../../shared/primitives/cn';

/**
 * Memoized customer row (U7 Performance & PWA, MEMO-1) — avoids re-rendering
 * every row on each search keystroke / parent state change when its own
 * props haven't changed.
 */
const CustomerRow = React.memo(function CustomerRow({
  customer,
  onSelect,
}: {
  customer: CustomerSummary;
  onSelect: (customer: CustomerSummary) => void;
}) {
  const archived = !isActiveClient(customer);
  return (
    <button
      type="button"
      data-testid={`admin-mobile-row-${customer.id}`}
      onClick={() => onSelect(customer)}
      className="w-full min-h-14 flex items-center gap-3 px-4 py-3 text-left rounded-xl hover:bg-white/5 active:bg-white/10 border border-transparent transition-colors"
    >
      {customer.avatar ? (
        <img
          src={customer.avatar}
          alt=""
          className={cn('w-10 h-10 rounded-full object-cover shrink-0 border border-white/10', archived && 'opacity-60')}
        />
      ) : (
        <div className="w-10 h-10 rounded-full bg-[#0F6B3E]/12 border border-[#0F6B3E]/20 flex items-center justify-center shrink-0">
          <User className="w-4.5 h-4.5 text-primary-text" aria-hidden="true" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className={cn('text-sm font-medium truncate', archived ? 'text-white/60' : 'text-white/90')}>{customer.id}</p>
        <p className="text-white/60 text-xs truncate flex items-center gap-1 mt-0.5 tabular-nums">
          <Phone className="w-3 h-3 shrink-0" aria-hidden="true" />
          {customer.phone_number}
        </p>
      </div>
      {archived ? (
        <span
          data-testid={`admin-mobile-row-archived-${customer.id}`}
          className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border shrink-0 bg-[#f87171]/10 border-error-text/30 text-error-text"
        >
          <Archive className="w-3 h-3" aria-hidden="true" />
          Đã nghỉ
        </span>
      ) : (
        customer.goal && (
          <span className="text-xs px-2 py-0.5 rounded-full border shrink-0 max-w-[96px] truncate bg-white/5 border-white/10 text-white/60">
            {customer.goal}
          </span>
        )
      )}
    </button>
  );
});

export interface CustomerListScreenProps {
  customers: CustomerSummary[];
  loading: boolean;
  error: string;
  search: string;
  onSearchChange: (v: string) => void;
  onSelect: (customer: CustomerSummary) => void;
  onRefresh: () => void | Promise<void>;
  /** Bell + overflow menu, shared by all mobile PT tabs (AdminHeaderActions). */
  headerActions?: React.ReactNode;
  onCreateMember?: () => void;
}

export function CustomerListScreen({
  customers,
  loading,
  error,
  search,
  onSearchChange,
  onSelect,
  onRefresh,
  headerActions,
  onCreateMember,
}: CustomerListScreenProps) {
  const [filter, setFilter] = useClientFilter();
  const [sort, setSort] = useState<SortMode>('alpha');

  // U21 (FR-7): accent/case-insensitive Vietnamese match ("nguyen" finds "Nguyễn").
  const filtered = sortClients(
    filterClients(customers, filter).filter((c) => matchesQuery([c.id, c.phone_number, c.goal], search)),
    sort,
  );
  const hasConstraint = !!search || filter !== DEFAULT_CLIENT_FILTER || filtered.length !== customers.length;

  return (
    <div className="flex flex-col min-h-0 flex-1">
      <StackHeader title="Hội viên" right={headerActions} />

      <div className="px-4 py-3 border-b border-white/6 space-y-2">
        <input
          type="text"
          data-testid="admin-mobile-search"
          aria-label="Tìm hội viên"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Tìm hội viên..."
          className="w-full bg-white/5 border border-white/10 focus:border-[#3DBE7A] rounded-xl px-4 py-2.5 text-white placeholder:text-white/40 outline-none transition-colors text-base"
        />
        <ClientFilterChips value={filter} onChange={setFilter} />
        <div className="flex items-center gap-1.5" role="group" aria-label="Sắp xếp">
          <span className="text-xs text-white/60 mr-1">Sắp xếp:</span>
          {SORT_OPTIONS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              data-testid={`admin-mobile-sort-${key}`}
              aria-pressed={sort === key}
              onClick={() => setSort(key)}
              className={cn(
                'tap-target inline-flex items-center justify-center px-3 rounded-full border text-xs transition-colors',
                sort === key
                  ? 'bg-[#0F6B3E]/20 border-primary-text/40 text-primary-text font-semibold'
                  : 'border-white/10 text-white/60',
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Await the real load so the pull spinner stays until data arrives. */}
      <PullToRefresh onRefresh={async () => { await onRefresh(); }} className="p-2 space-y-0.5">
        {loading && (
          <div className="space-y-1 p-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2.5">
                <div className="w-9 h-9 rounded-full bg-white/[0.06] animate-pulse shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 w-28 bg-white/[0.06] rounded animate-pulse" />
                  <div className="h-2.5 w-20 bg-white/[0.04] rounded animate-pulse" />
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
          filtered.map((c) => <CustomerRow key={c.id} customer={c} onSelect={onSelect} />)}
      </PullToRefresh>

      {!loading && (
        <div className="app-chrome shrink-0 px-4 py-2.5 border-t border-white/6 bg-[#0A0A0A]/95 backdrop-blur-sm flex items-center justify-between">
          <p className="text-white/60 text-xs tabular-nums">
            {hasConstraint ? `${filtered.length} / ${customers.length} hội viên` : `${customers.length} hội viên`}
          </p>
          {onCreateMember && (
            <button type="button" onClick={onCreateMember}
              className="tap-target flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm text-primary-text bg-[#0F6B3E]/10 border border-[#0F6B3E]/20 hover:bg-[#0F6B3E]/20 transition-colors">
              <Plus className="w-3.5 h-3.5" aria-hidden="true" /> Tạo hội viên
            </button>
          )}
        </div>
      )}
    </div>
  );
}
