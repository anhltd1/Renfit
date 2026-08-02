/**
 * Trainer mobile customer-list screen (U6 Trainer Mobile, TR-2, TR-6).
 * Root of the "Hội viên" tab: search + scrollable list, with refresh,
 * TrainerNotificationBell (reused as-is, NOTIF-1), and logout as header
 * actions — mirrors desktop DesktopAdminHeader's actions, relocated per
 * mobile's lack of a persistent top bar.
 */
import React from 'react';
import { LogOut, Phone, RefreshCw, User, Users } from 'lucide-react';
import type { CustomerSummary } from '../../../lib/api/admin';
import { TrainerNotificationBell } from '../../components/TrainerNotificationBell';
import { StackHeader } from '../shell/StackHeader';

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

      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {loading && (
          <div className="flex items-center justify-center py-16 text-white/25">
            <RefreshCw className="w-5 h-5 animate-spin" />
          </div>
        )}
        {!loading && error && (
          <p className="text-red-400 text-xs p-4 bg-red-400/10 rounded-xl m-2">{error}</p>
        )}
        {!loading && !error && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-white/20 gap-2">
            <Users className="w-8 h-8" />
            <p className="text-sm">{search ? 'Không tìm thấy.' : 'Chưa có hội viên.'}</p>
          </div>
        )}
        {!loading &&
          !error &&
          filtered.map((c) => <CustomerRow key={c.id} customer={c} onSelect={onSelect} />)}
      </div>

      {!loading && filtered.length > 0 && (
        <div className="shrink-0 px-4 py-2.5 border-t border-white/6 bg-[#0A0A0A]/95 backdrop-blur-sm">
          <p className="text-white/25 text-xs">
            {search ? `${filtered.length} / ${customers.length} hội viên` : `${customers.length} hội viên`}
          </p>
        </div>
      )}
    </div>
  );
}
