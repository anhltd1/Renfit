/**
 * Desktop admin dashboard header (U5 Trainer Desktop, EXT-1).
 * View toggle (Hôm nay / Hội viên / Lịch đặt / Trang chủ), customer-count pill,
 * refresh, notification bell, interface menu and logout.
 *
 * U25: tabs expose `aria-current="page"` inside a labelled nav landmark and use
 * `.tap-target`; an overflow menu ("Thêm") lets a PT on a big phone / tablet
 * switch to the phone tree via DeviceProvider's `setOverride` (FR-13).
 */
import { useContext, useEffect, useId, useRef, useState } from 'react';
import {
  CalendarDays,
  Check,
  Home,
  Layout,
  LogOut,
  MoreVertical,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  Users,
  Wand2,
} from 'lucide-react';
import { LiveClock } from '../../components/LiveClock';
import { TrainerNotificationBell } from '../../components/TrainerNotificationBell';
import { DeviceContext } from '../../device/DeviceContext';
import { cn } from '../../shared/primitives/cn';

type AdminView = 'today' | 'clients' | 'bookings' | 'cms';

export interface DesktopAdminHeaderProps {
  view: AdminView;
  onViewChange: (view: AdminView) => void;
  customerCount: number;
  onRefresh: () => void;
  refreshing: boolean;
  onLogout: () => void;
}

const TABS: { key: AdminView; label: string; Icon: typeof Home }[] = [
  { key: 'today', label: 'Hôm nay', Icon: Home },
  { key: 'clients', label: 'Hội viên', Icon: Users },
  { key: 'bookings', label: 'Lịch đặt', Icon: CalendarDays },
  { key: 'cms', label: 'Trang chủ', Icon: Layout },
];

const MENU_ITEM_CLS =
  'w-full min-h-8 pointer-coarse:min-h-11 flex items-center gap-3 px-4 py-2.5 text-left text-sm leading-relaxed text-white/80 hover:bg-white/5 focus-visible:outline-none focus-visible:bg-white/10 transition-colors';

/** Overflow menu: interface (phone tree / auto) choice. */
function InterfaceMenu() {
  const device = useContext(DeviceContext);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  const close = (returnFocus = true) => {
    setOpen(false);
    if (returnFocus) buttonRef.current?.focus();
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        close();
      }
    };
    const onPointer = (e: MouseEvent | TouchEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) close(false);
    };
    window.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('touchstart', onPointer);
    menuRef.current?.querySelector<HTMLButtonElement>('[role="menuitemradio"]')?.focus();
    return () => {
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('touchstart', onPointer);
    };
  }, [open]);

  if (!device) return null;

  const override = device.override;
  const phoneMode = override === 'mobile';
  const run = (next: 'mobile' | null) => {
    close(false);
    device.setOverride(next);
  };

  return (
    <div ref={rootRef} className="relative" data-testid="admin-header-actions">
      <button
        ref={buttonRef}
        type="button"
        data-testid="admin-header-menu"
        aria-label="Thêm"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen((o) => !o)}
        className="tap-target flex items-center justify-center rounded-xl text-white/70 hover:text-white hover:bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3DBE7A]"
      >
        <MoreVertical className="w-4 h-4" aria-hidden="true" />
      </button>
      {open && (
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          aria-label="Tuỳ chọn"
          data-testid="admin-header-menu-list"
          className="absolute right-0 top-full mt-2 z-40 w-64 py-1 rounded-2xl border border-white/10 bg-[#111] shadow-2xl"
        >
          <p className="px-4 pt-1 pb-0.5 text-xs text-white/60 leading-relaxed">Giao diện</p>
          <button
            type="button"
            role="menuitemradio"
            aria-checked={phoneMode}
            data-testid="admin-menu-phone"
            onClick={() => run('mobile')}
            className={MENU_ITEM_CLS}
          >
            <Smartphone className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span className="flex-1">Chế độ điện thoại</span>
            {phoneMode && <Check className="w-4 h-4 text-primary-text" aria-hidden="true" />}
          </button>
          <button
            type="button"
            role="menuitemradio"
            aria-checked={override === null}
            data-testid="admin-menu-auto"
            onClick={() => run(null)}
            className={MENU_ITEM_CLS}
          >
            <Wand2 className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span className="flex-1">Tự động</span>
            {override === null && <Check className="w-4 h-4 text-primary-text" aria-hidden="true" />}
          </button>
        </div>
      )}
    </div>
  );
}

export function DesktopAdminHeader({
  view,
  onViewChange,
  customerCount,
  onRefresh,
  refreshing,
  onLogout,
}: DesktopAdminHeaderProps) {
  return (
    <header
      className="shrink-0 bg-[#0B0B0B] border-b border-white/10 px-4 py-2.5 flex items-center justify-between gap-2"
      style={{ paddingTop: 'max(0.625rem, env(safe-area-inset-top))' }}
    >
      {/* Left */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-8 h-8 shrink-0 rounded-lg bg-[#0F6B3E]/20 border border-[#0F6B3E]/30 flex items-center justify-center">
          <ShieldCheck className="w-4 h-4 text-primary-text" aria-hidden="true" />
        </div>
        <span className="text-white font-bold text-sm whitespace-nowrap">Renfit Admin</span>

        {/* View tabs */}
        <nav
          aria-label="Điều hướng quản trị"
          className="flex items-center gap-1 ml-4 bg-white/5 border border-white/10 rounded-lg p-0.5 shrink-0"
        >
          {TABS.map(({ key, label, Icon }) => {
            const active = view === key;
            return (
              <button
                key={key}
                type="button"
                data-testid={`tab-${key}`}
                aria-current={active ? 'page' : undefined}
                onClick={() => onViewChange(key)}
                className={cn(
                  'tap-target flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-md text-sm transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3DBE7A]',
                  active ? 'bg-[#0F6B3E]/20 text-primary-text' : 'text-white/70 hover:text-white',
                )}
              >
                <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Center — live clock */}
      <div className="flex justify-center flex-1">
        <LiveClock />
      </div>

      {/* Right */}
      <div className="flex items-center gap-2 justify-end shrink-0">
        {view === 'clients' && (
          <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 mr-2">
            <Users className="w-3.5 h-3.5 text-primary-text" aria-hidden="true" />
            <span className="text-white/60 text-sm">
              <span className="text-white font-semibold tabular-nums">{customerCount}</span> hội viên
            </span>
          </div>
        )}
        {view === 'clients' && (
          <button
            type="button"
            data-testid="button-refresh"
            onClick={onRefresh}
            disabled={refreshing}
            className="tap-target flex items-center justify-center rounded-xl text-white/70 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3DBE7A]"
            title="Làm mới"
            aria-label="Làm mới"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} aria-hidden="true" />
          </button>
        )}
        <TrainerNotificationBell
          onNavigate={(v) => {
            if (v === 'today' || v === 'clients' || v === 'bookings') onViewChange(v);
          }}
        />
        <InterfaceMenu />
        <button
          type="button"
          data-testid="button-logout"
          onClick={onLogout}
          className="tap-target flex items-center gap-1.5 text-white/70 hover:text-error-text transition-colors text-sm px-2 py-2 rounded-xl hover:bg-red-400/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3DBE7A]"
        >
          <LogOut className="w-4 h-4" aria-hidden="true" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </header>
  );
}
