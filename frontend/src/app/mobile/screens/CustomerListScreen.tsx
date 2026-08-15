/**
 * Trainer mobile customer-list screen (U6 Trainer Mobile, TR-2, TR-6).
 * Root of the "Hội viên" tab: search + scrollable list, with refresh,
 * TrainerNotificationBell (reused as-is, NOTIF-1), and logout as header
 * actions — mirrors desktop DesktopAdminHeader's actions, relocated per
 * mobile's lack of a persistent top bar.
 */
import React, { useCallback } from 'react';
import { LogOut, Phone, Plus, RefreshCw, User, Users } from 'lucide-react';
import type { CustomerSummary } from '../../../lib/api/admin';
import { TrainerNotificationBell } from '../../components/TrainerNotificationBell';
import { StackHeader } from '../shell/StackHeader';
import { PullToRefresh } from '../../shared/primitives/PullToRefresh';

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
  return (
    <button
      type="button"
      data-testid={`admin-mobile-row-${customer.id}`}
      onClick={() => onSelect(customer)}
      className="w-full flex items-center gap-3 px-4 py-3 text-left rounded-xl hover:bg-white/5 border border-transparent transition-all"
    >
      {customer.avatar ? (
        <img
          src={customer.avatar}
          alt={customer.id}
          className="w-10 h-10 rounded-full object-cover shrink-0 border border-white/10"
        />
      ) : (
        <div className="w-10 h-10 rounded-full bg-[#0F6B3E]/12 border border-[#0F6B3E]/20 flex items-center justify-center shrink-0">
          <User className="w-4.5 h-4.5 text-[#0F6B3E]" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate text-white/75">{customer.id}</p>
        <p className="text-white/35 text-xs truncate flex items-center gap-1 mt-0.5">
          <Phone className="w-2.5 h-2.5 shrink-0" />
          {customer.phone_number}
        </p>
      </div>
      {customer.goal && (
        <span className="text-[10px] px-2 py-0.5 rounded-full border shrink-0 max-w-[80px] truncate bg-white/5 border-white/10 text-white/40">
          {customer.goal}
        </span>
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
  onRefresh: () => void;
  refreshing: boolean;
  onLogout: () => void;
  onNavigateFromNotification: (view: string) => void;
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
  refreshing,
  onLogout,
  onNavigateFromNotification,
  onCreateMember,
}: CustomerListScreenProps) {
  const filtered = customers.filter(
    (c) =>
      c.id.toLowerCase().includes(search.toLowerCase()) ||
      c.phone_number.includes(search) ||
      c.goal.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="flex flex-col min-h-0 flex-1">
      <StackHeader
        title="Hội viên"
        right={
          <div className="flex items-center gap-1">
            <button
              type="button"
              data-testid="admin-mobile-refresh"
              onClick={onRefresh}
              disabled={refreshing}
              className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-all disabled:opacity-40"
              title="Làm mới"
              aria-label="Làm mới"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <TrainerNotificationBell onNavigate={onNavigateFromNotification} />
            <button
              type="button"
              data-testid="admin-mobile-logout"
              onClick={onLogout}
              aria-label="Đăng xuất"
              className="p-2 rounded-xl text-white/40 hover:text-red-400 hover:bg-red-400/5 transition-all"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        }
      />

      <div className="px-4 py-3 border-b border-white/6">
        <input
          type="text"
          data-testid="admin-mobile-search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Tìm hội viên..."
          className="w-full bg-white/5 border border-white/8 focus:border-[#0F6B3E] rounded-xl px-4 py-2.5 text-white placeholder:text-white/25 outline-none transition-colors text-sm"
        />
      </div>

      <PullToRefresh onRefresh={async () => { onRefresh(); }} className="p-2 space-y-0.5">
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
          <p className="text-red-400 text-xs p-4 bg-red-400/10 rounded-xl m-2">{error}</p>
        )}
        {!loading && !error && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-white/25 gap-2">
            <Users className="w-7 h-7" />
            <p className="text-sm font-medium">{search ? 'Không tìm thấy hội viên.' : 'Chưa có hội viên nào.'}</p>
            <p className="text-xs text-white/15">{search ? 'Thử tìm với từ khóa khác.' : 'Hội viên mới sẽ xuất hiện khi đăng ký.'}</p>
          </div>
        )}
        {!loading &&
          !error &&
          filtered.map((c) => <CustomerRow key={c.id} customer={c} onSelect={onSelect} />)}
      </PullToRefresh>

      {!loading && (
        <div className="shrink-0 px-4 py-2.5 border-t border-white/6 bg-[#0A0A0A]/95 backdrop-blur-sm flex items-center justify-between">
          <p className="text-white/25 text-xs">
            {customers.length} hội viên
          </p>
          {onCreateMember && (
            <button type="button" onClick={onCreateMember}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-[#0F6B3E] bg-[#0F6B3E]/10 border border-[#0F6B3E]/20 hover:bg-[#0F6B3E]/20 transition-all">
              <Plus className="w-3.5 h-3.5" /> Tạo hội viên
            </button>
          )}
        </div>
      )}
    </div>
  );
}
