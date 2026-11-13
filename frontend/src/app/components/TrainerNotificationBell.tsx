/**
 * Trainer-facing notification bell + top-center popup toasts.
 *
 * Two independent UI pieces sharing the same poll:
 * - The bell + dropdown behaves like the customer NotificationBell (shows
 *   the full list normally, on demand).
 * - Any notification created since the last poll also fires a transient
 *   popup centered at the top of the screen that auto-dismisses — this is
 *   the "new booking / new trainee" live-alert requested for the PT view.
 *
 * See backend/docs/notifications.md for the full design.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Bell, Calendar, CalendarX, UserPlus, X } from 'lucide-react';
import {
  fetchTrainerNotifications,
  fetchTrainerUnreadCount,
  markAllTrainerNotificationsRead,
  markTrainerNotificationRead,
  parseAdminNotificationTarget,
  type TrainerNotification,
  type TrainerNotificationType,
} from '../../lib/api/admin';
import { usePushNotifications } from '../shared/hooks/usePushNotifications';
import { useNotificationRefresh } from '../shared/hooks/useTrainerNotifications';

const POPUP_DURATION_MS = 5_000;

const ICON_BY_TYPE: Record<TrainerNotificationType, React.ComponentType<{ className?: string }>> = {
  booking_created: Calendar,
  booking_cancelled: CalendarX,
  trainee_registered: UserPlus,
};

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const diffMin = Math.round((Date.now() - then) / 60_000);
  if (diffMin < 1) return 'Vừa xong';
  if (diffMin < 60) return `${diffMin} phút trước`;
  const diffHour = Math.round(diffMin / 60);
  if (diffHour < 24) return `${diffHour} giờ trước`;
  const diffDay = Math.round(diffHour / 24);
  return `${diffDay} ngày trước`;
}

interface TrainerNotificationBellProps {
  /** Called with the target view key (e.g. "bookings", "clients") when a notification is clicked. */
  onNavigate: (view: string) => void;
}

export function TrainerNotificationBell({ onNavigate }: TrainerNotificationBellProps) {
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [notifications, setNotifications] = useState<TrainerNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [popups, setPopups] = useState<TrainerNotification[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const seenIdsRef = useRef<Set<string> | null>(null);

  const poll = useCallback(() => {
    fetchTrainerNotifications()
      .then((all) => {
        if (seenIdsRef.current === null) {
          // First poll — seed known ids without popping toasts for history.
          seenIdsRef.current = new Set(all.map((n) => n.id));
        } else {
          const fresh = all.filter((n) => !seenIdsRef.current!.has(n.id));
          if (fresh.length > 0) {
            fresh.forEach((n) => seenIdsRef.current!.add(n.id));
            setPopups((prev) => [...prev, ...fresh]);
          }
        }
        setUnread(all.filter((n) => !n.read).length);
      })
      .catch(() => {});
  }, []);

  // Push active -> no interval (refetch on tab visible / push message); otherwise 10 s polling.
  const { supported, permission, subscribed } = usePushNotifications('trainer', true);
  const pushActive = supported && permission === 'granted' && subscribed;
  useNotificationRefresh(poll, pushActive);

  // Auto-dismiss each popup independently after POPUP_DURATION_MS.
  useEffect(() => {
    if (popups.length === 0) return;
    const timers = popups.map((p) =>
      setTimeout(() => {
        setPopups((prev) => prev.filter((x) => x.id !== p.id));
      }, POPUP_DURATION_MS),
    );
    return () => timers.forEach(clearTimeout);
  }, [popups]);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const handleToggle = () => {
    const next = !open;
    setOpen(next);
    if (next) {
      setLoading(true);
      fetchTrainerNotifications()
        .then(setNotifications)
        .finally(() => setLoading(false));
    }
  };

  const navigateFromTarget = (target: string) => {
    const view = parseAdminNotificationTarget(target);
    if (view) onNavigate(view);
  };

  const handleNotificationClick = (n: TrainerNotification) => {
    if (!n.read) {
      setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
      setUnread((prev) => Math.max(0, prev - 1));
      markTrainerNotificationRead(n.id).catch(() => {});
    }
    setOpen(false);
    navigateFromTarget(n.target);
  };

  const handlePopupClick = (n: TrainerNotification) => {
    setPopups((prev) => prev.filter((x) => x.id !== n.id));
    markTrainerNotificationRead(n.id).catch(() => {});
    setUnread((prev) => Math.max(0, prev - 1));
    navigateFromTarget(n.target);
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnread(0);
    markAllTrainerNotificationsRead().catch(() => {});
  };

  return (
    <>
      {/* Top-center popup toasts */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 items-center pointer-events-none px-4 w-full max-w-md">
        {popups.map((p) => {
          const Icon = ICON_BY_TYPE[p.type] ?? Bell;
          return (
            <div
              key={p.id}
              role="button"
              tabIndex={0}
              onClick={() => handlePopupClick(p)}
              onKeyDown={(e) => {
                if (e.key !== 'Enter' && e.key !== ' ') return;
                e.preventDefault();
                handlePopupClick(p);
              }}
              aria-label={`${p.title}: ${p.message}`}
              className="pointer-events-auto flex items-center gap-3 bg-[#141414] border border-[#0F6B3E]/40 rounded-panel shadow-2xl px-4 py-3 w-full cursor-pointer hover:border-[#0F6B3E] transition-all animate-popup-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-text"
            >
              <div className="w-9 h-9 rounded-full bg-surface-2 flex items-center justify-center shrink-0">
                <Icon className="w-[18px] h-[18px] text-primary-text" />
              </div>
              <div className="min-w-0">
                <p className="text-white text-sm font-medium truncate">{p.title}</p>
                <p className="text-white/64 text-xs mt-0.5 truncate">{p.message}</p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setPopups((prev) => prev.filter((x) => x.id !== p.id));
                }}
                className="text-white/64 hover:text-white transition-colors shrink-0 tap-target inline-flex items-center justify-center"
                aria-label="Đóng"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Bell + dropdown */}
      <div className="relative" ref={containerRef}>
        <button
          type="button"
          onClick={handleToggle}
          className="relative w-9 h-9 tap-target rounded-control text-white/64 hover:text-white hover:bg-white/5 flex items-center justify-center transition-all"
          aria-label="Thông báo"
        >
          <Bell className="w-4 h-4" />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] tabular-nums px-1 rounded-full bg-primary border-2 border-[#0B0B0B] text-xs font-bold text-white flex items-center justify-center">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </button>

        {open && (
          <div className="absolute right-0 mt-2 w-[min(20rem,calc(100vw-2rem))] max-h-96 overflow-y-auto bg-[#141414] border border-line rounded-panel shadow-2xl z-50">
            <div className="flex items-center justify-between px-4 py-3 border-b border-line">
              <span className="text-white text-sm font-semibold">Thông báo</span>
              {notifications.some((n) => !n.read) && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  className="text-primary-text text-xs hover:underline tap-target"
                >
                  Đánh dấu đã đọc tất cả
                </button>
              )}
            </div>

            {loading ? (
              <p className="text-white/64 text-sm text-center py-8">Đang tải...</p>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-white/64 gap-1.5">
                <Bell className="w-6 h-6" />
                <p className="text-sm">Không có thông báo mới.</p>
                <p className="text-xs text-white/64">Thông báo sẽ hiển thị khi hội viên đặt lịch.</p>
              </div>
            ) : (
              <div className="divide-y divide-line">
                {notifications.map((n) => {
                  const Icon = ICON_BY_TYPE[n.type] ?? Bell;
                  return (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => handleNotificationClick(n)}
                      className={`w-full text-left px-4 py-3 flex gap-3 hover:bg-white/5 transition-colors ${
                        !n.read ? 'border-l-2 border-[#0F6B3E] bg-[#0F6B3E]/5' : ''
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-surface-2 flex items-center justify-center shrink-0 mt-0.5">
                        <Icon className="w-4 h-4 text-primary-text" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm ${!n.read ? 'text-white font-medium' : 'text-white/70'}`}>
                          {n.title}
                        </p>
                        <p className="text-white/64 text-xs mt-0.5 leading-relaxed">{n.message}</p>
                        <p className="text-white/64 text-xs mt-1">{relativeTime(n.created_at)}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
