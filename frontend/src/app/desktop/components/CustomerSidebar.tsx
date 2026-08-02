/**
 * Desktop admin customer sidebar (U5 Trainer Desktop, DL-1/DL-4).
 * Always visible (no hidden md:flex / isMobile branching — device selection
 * already happened at the route entry). Search + scrollable list + footer count.
 */
import { RefreshCw, Search, Users } from 'lucide-react';
import type { CustomerSummary } from '../../../lib/api/admin';
import { SidebarRow } from './SidebarRow';

export interface CustomerSidebarProps {
  customers: CustomerSummary[];
  selectedId: string | null;
  search: string;
  onSearchChange: (v: string) => void;
  onSelect: (customer: CustomerSummary) => void;
  loading: boolean;
  error: string;
}

export function CustomerSidebar({
  customers,
  selectedId,
  search,
  onSearchChange,
  onSelect,
  loading,
  error,
}: CustomerSidebarProps) {
  const filtered = customers.filter(
    (c) =>
      c.id.toLowerCase().includes(search.toLowerCase()) ||
      c.phone_number.includes(search) ||
      c.goal.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <aside className="w-72 lg:w-80 shrink-0 flex flex-col border-r border-white/8 bg-[#0A0A0A]">
      <div className="p-3 border-b border-white/6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25 pointer-events-none" />
          <input
            type="text"
            data-testid="input-customer-search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm hội viên..."
            className="w-full bg-white/5 border border-white/8 focus:border-[#0F6B3E] rounded-xl pl-9 pr-4 py-2 text-white placeholder:text-white/25 outline-none transition-colors text-sm"
          />
        </div>
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
          filtered.map((c) => (
            <SidebarRow key={c.id} customer={c} selected={selectedId === c.id} onClick={() => onSelect(c)} />
          ))}
      </div>

      {!loading && filtered.length > 0 && (
        <div className="px-4 py-2.5 border-t border-white/6">
          <p className="text-white/25 text-xs">
            {search ? `${filtered.length} / ${customers.length} hội viên` : `${customers.length} hội viên`}
          </p>
        </div>
      )}
    </aside>
  );
}
