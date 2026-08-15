/**
 * Notification bell — polls unread count, shows a dropdown of recent
 * notifications, and routes to the right dashboard tab on click.
 * See backend/docs/notifications.md for the full design.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Bell, Calendar, Clock, Sparkles } from 'lucide-react';
import {
  fetchNotifications,
  fetchUnreadCount,
  markAllNotificationsRead,
  markNotificationRead,
  parseNotificationTarget,
  type AppNotification,
  type NotificationType,
} from '../../lib/api/notifications';

const POLL_INTERVAL_MS = 30_000;

const ICON_BY_TYPE: Record<NotificationType, React.ComponentType<{ className?: string }>> = {
  booking_approved: Calendar,
  session_reminder: Clock,
  inbody_added: Sparkles,
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

interface NotificationBellProps {
  customerId: string;
  /** Called with the target tab key (e.g. "bookings", "overview") when a notification is clicked. */
  onNavigate: (tab: string) => void;
}

export function NotificationBell({ customerId, onNavigate }: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [ringing, setRinging] = useState(false);
  const prevUnreadRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Trigger bell ring when unread count increases
  useEffect(() => {
    if (unread > prevUnreadRef.current && prevUnreadRef.current >= 0) {
      setRinging(true);
      const t = setTimeout(() => setRinging(false), 700);
      return () => clearTimeout(t);
    }
    prevUnreadRef.current = unread;
  }, [unread]);

  const refreshUnreadCount = useCallback(() => {
    fetchUnreadCount(customerId).then(setUnread).catch(() => {});
  }, [customerId]);

  useEffect(() => {
    refreshUnreadCount();
    const id = setInterval(refreshUnreadCount, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [refreshUnreadCount]);

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
      fetchNotifications(customerId)
        .then(setNotifications)
        .finally(() => setLoading(false));
    }
  };

  const handleNotificationClick = async (n: AppNotification) => {
    if (!n.read) {
      setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
      setUnread((prev) => Math.max(0, prev - 1));
      markNotificationRead(n.id, customerId).catch(() => {});
    }
    setOpen(false);
    const tab = parseNotificationTarget(n.target);
    if (tab) onNavigate(tab);
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnread(0);
    markAllNotificationsRead(customerId).catch(() => {});
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={handleToggle}
        className="relative w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-colors"
        aria-label="Thông báo"
      >
        <Bell className={`w-[18px] h-[18px] text-white/80 ${ringing ? 'animate-bell-ring' : ''}`} />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#0F6B3E] border-2 border-black text-[10px] font-bold text-white flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-[min(20rem,calc(100vw-2rem))] max-h-96 overflow-y-auto bg-[#141414] border border-white/10 rounded-2xl shadow-2xl z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <span className="text-white text-sm font-semibold">Thông báo</span>
            {notifications.some((n) => !n.read) && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-[#0F6B3E] text-xs hover:underline"
              >
                Đánh dấu đã đọc tất cả
              </button>
            )}
          </div>

          {loading ? (
            <p className="text-white/40 text-sm text-center py-8">Đang tải...</p>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-white/25 gap-1.5">
              <Bell className="w-6 h-6" />
              <p className="text-sm">Không có thông báo mới.</p>
              <p className="text-xs text-white/15">Bạn sẽ nhận thông báo khi có cập nhật.</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
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
                    <div className="w-8 h-8 rounded-full bg-[#0F6B3E]/15 flex items-center justify-center shrink-0 mt-0.5">
                      <Icon className="w-4 h-4 text-[#0F6B3E]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm ${!n.read ? 'text-white font-medium' : 'text-white/70'}`}>
                        {n.title}
                      </p>
                      <p className="text-white/50 text-xs mt-0.5 leading-relaxed">{n.message}</p>
                      <p className="text-white/30 text-[11px] mt-1">{relativeTime(n.created_at)}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
