/**
 * Desktop admin customer sidebar (U5 Trainer Desktop, DL-1/DL-4).
 * Always visible (no hidden md:flex / isMobile branching — device selection
 * already happened at the route entry). Search + scrollable list + footer count.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { Plus, Search, Users } from 'lucide-react';
import type { CustomerSummary } from '../../../lib/api/admin';
import { SidebarRow } from './SidebarRow';

type SortMode = 'alpha' | 'lastSession' | 'nextSession';

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
  const searchRef = useRef<HTMLInputElement>(null);
  const [highlightIdx, setHighlightIdx] = useState(-1);

  const filtered = customers
    .filter(
      (c) =>
        c.id.toLowerCase().includes(search.toLowerCase()) ||
        c.phone_number.includes(search) ||
        c.goal.toLowerCase().includes(search.toLowerCase()),
    )
    .sort((a, b) => {
      // Active members first, archived at the bottom
      const aActive = a.active !== false;
      const bActive = b.active !== false;
      if (aActive && !bActive) return -1;
      if (!aActive && bActive) return 1;

      // Then apply selected sort within each group
      if (sort === 'lastSession') {
        const aLast = a.last_session ?? '';
        const bLast = b.last_session ?? '';
        return aLast.localeCompare(bLast); // oldest first
      }
      if (sort === 'nextSession') {
        const aNext = a.next_session ?? 'z';
        const bNext = b.next_session ?? 'z';
        return aNext.localeCompare(bNext); // soonest first
      }
      return a.id.localeCompare(b.id); // alpha
    });

  // Step 5: Keyboard navigation
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
    <aside className="w-72 lg:w-80 shrink-0 flex flex-col border-r border-white/8 bg-[#0A0A0A]">
      <div className="p-3 border-b border-white/6 space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25 pointer-events-none" />
          <input
            ref={searchRef}
            type="text"
            data-testid="input-customer-search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm hội viên... ( / )"
            className="w-full bg-white/5 border border-white/8 focus:border-[#0F6B3E] rounded-xl pl-9 pr-4 py-2 text-white placeholder:text-white/25 outline-none transition-colors text-sm"
          />
        </div>
        {/* Sort pills */}
        <div className="flex items-center gap-1">
          {([['alpha', 'A–Z'], ['lastSession', 'Gần nhất'], ['nextSession', 'Sắp tới']] as const).map(([key, label]) => (
            <button key={key} type="button" onClick={() => setSort(key)}
              className={`text-[10px] px-2 py-0.5 rounded-full border transition-all ${
                sort === key
                  ? 'bg-[#0F6B3E]/20 border-[#0F6B3E]/40 text-[#0F6B3E]'
                  : 'border-white/10 text-white/30 hover:text-white/50 hover:border-white/20'
              }`}>{label}</button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {loading && (
          <div className="space-y-1 p-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2.5 px-3 py-2">
                <div className="w-8 h-8 rounded-full bg-white/[0.06] animate-pulse shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-24 bg-white/[0.06] rounded animate-pulse" />
                  <div className="h-2.5 w-16 bg-white/[0.04] rounded animate-pulse" />
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
          filtered.map((c, i) => (
            <div key={c.id} className="animate-fade-up" style={{ '--stagger': i } as React.CSSProperties}>
              <SidebarRow customer={c} selected={selectedId === c.id} onClick={() => onSelect(c)} />
            </div>
          ))}
      </div>

      {!loading && filtered.length > 0 && (
        <div className="px-4 py-2.5 border-t border-white/6">
          <p className="text-white/25 text-xs">
            {search ? `${filtered.length} / ${customers.length}` : `${customers.length} hội viên`}
          </p>
        </div>
      )}

      {/* Create member button */}
      {onCreateMember && (
        <div className="px-3 py-2 border-t border-white/6">
          <button type="button" onClick={onCreateMember}
            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs text-[#0F6B3E] bg-[#0F6B3E]/10 border border-[#0F6B3E]/20 hover:bg-[#0F6B3E]/20 transition-all">
            <Plus className="w-3.5 h-3.5" /> Tạo hội viên
          </button>
        </div>
      )}
    </aside>
  );
}
