/**
 * Shared PT header actions for every mobile admin tab (U24, FR-4/FR-13, A6):
 * the trainer notification bell plus an overflow menu ("Thêm") with
 * Làm mới / Chế độ máy tính bảng / Tự động / Đăng xuất.
 *
 * Tablet mode = the existing DeviceProvider override set to 'desktop'
 * (persisted under its localStorage key); "Tự động" clears it.
 */
import { useContext, useEffect, useId, useRef, useState } from 'react';
import { Check, LogOut, MoreVertical, RefreshCw, Smartphone, Tablet } from 'lucide-react';
import { TrainerNotificationBell } from '../../components/TrainerNotificationBell';
import { DeviceContext } from '../../device/DeviceContext';
import { cn } from '../../shared/primitives/cn';

export interface AdminHeaderActionsProps {
  onNavigate: (view: string) => void;
  onLogout: () => void;
  onRefresh?: () => void | Promise<void>;
  refreshing?: boolean;
}

export function AdminHeaderActions({ onNavigate, onLogout, onRefresh, refreshing = false }: AdminHeaderActionsProps) {
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
    // Move focus into the menu for keyboard users.
    menuRef.current?.querySelector<HTMLButtonElement>('[role="menuitem"],[role="menuitemradio"]')?.focus();
    return () => {
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('touchstart', onPointer);
    };
  }, [open]);

  const override = device?.override ?? null;
  const tabletMode = override === 'desktop';

  const run = (fn: () => void) => {
    close(false);
    fn();
  };

  const itemCls =
    'w-full min-h-11 flex items-center gap-3 px-4 py-2.5 text-left text-sm leading-relaxed text-white/80 hover:bg-white/5 focus-visible:outline-none focus-visible:bg-white/10 transition-colors disabled:opacity-50';

  return (
    <div ref={rootRef} className="relative flex items-center gap-1" data-testid="admin-header-actions">
      <TrainerNotificationBell onNavigate={onNavigate} />
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
        <MoreVertical className="w-5 h-5" aria-hidden="true" />
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
          {onRefresh && (
            <button
              type="button"
              role="menuitem"
              data-testid="admin-menu-refresh"
              disabled={refreshing}
              onClick={() => run(() => { void onRefresh(); })}
              className={itemCls}
            >
              <RefreshCw className={cn('w-4 h-4 shrink-0', refreshing && 'animate-spin')} aria-hidden="true" />
              Làm mới
            </button>
          )}
          {device && (
            <>
              <div className="my-1 border-t border-white/10" role="separator" />
              <p className="px-4 pt-1 pb-0.5 text-xs text-white/60 leading-relaxed">Giao diện</p>
              <button
                type="button"
                role="menuitemradio"
                aria-checked={tabletMode}
                data-testid="admin-menu-tablet"
                onClick={() => run(() => device.setOverride('desktop'))}
                className={itemCls}
              >
                <Tablet className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span className="flex-1">Chế độ máy tính bảng</span>
                {tabletMode && <Check className="w-4 h-4 text-primary-text" aria-hidden="true" />}
              </button>
              <button
                type="button"
                role="menuitemradio"
                aria-checked={override === null}
                data-testid="admin-menu-auto"
                onClick={() => run(() => device.setOverride(null))}
                className={itemCls}
              >
                <Smartphone className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span className="flex-1">Tự động</span>
                {override === null && <Check className="w-4 h-4 text-primary-text" aria-hidden="true" />}
              </button>
            </>
          )}
          <div className="my-1 border-t border-white/10" role="separator" />
          <button
            type="button"
            role="menuitem"
            data-testid="admin-mobile-logout"
            onClick={() => run(onLogout)}
            className={cn(itemCls, 'text-error-text')}
          >
            <LogOut className="w-4 h-4 shrink-0" aria-hidden="true" />
            Đăng xuất
          </button>
        </div>
      )}
    </div>
  );
}
