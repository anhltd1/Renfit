import { useCallback, useEffect, useRef, useState } from 'react';
import {
  fetchTrainerNotifications,
  fetchTrainerUnreadCount,
  markAllTrainerNotificationsRead,
  markTrainerNotificationRead,
  type TrainerNotification,
} from '../../../lib/api/admin';

const POLL_INTERVAL_MS = 10_000;

/**
 * Trainer-facing (broadcast) notifications (U2 Shared Data Layer).
 * Push replaces polling (U17). Refetches on visibility change as fallback.
 * Popup-queue tracking: any notification not seen in a prior fetch is pushed
 * into `popups`; the caller (bell component) owns rendering/auto-dismiss.
 */
export function useTrainerNotifications() {
  const [notifications, setNotifications] = useState<TrainerNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [popups, setPopups] = useState<TrainerNotification[]>([]);
  const seenIdsRef = useRef<Set<string> | null>(null);

  const poll = useCallback(async () => {
    try {
      const all = await fetchTrainerNotifications();
      if (seenIdsRef.current === null) {
        seenIdsRef.current = new Set(all.map((n) => n.id));
      } else {
        const fresh = all.filter((n) => !seenIdsRef.current!.has(n.id));
        if (fresh.length > 0) {
          fresh.forEach((n) => seenIdsRef.current!.add(n.id));
          setPopups((prev) => [...prev, ...fresh]);
        }
      }
      setNotifications(all);
      setUnreadCount(all.filter((n) => !n.read).length);
    } catch {
      /* keep last known state on transient failure */
    }
  }, []);

  // Initial fetch + visibility-based refetch (replaces polling)
  useEffect(() => {
    void poll();
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') poll();
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [poll]);

  const dismissPopup = useCallback((id: string) => {
    setPopups((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const markRead = useCallback(async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    setUnreadCount((prev) => Math.max(0, prev - 1));
    dismissPopup(id);
    try {
      await markTrainerNotificationRead(id);
    } catch {
      /* optimistic update stands; next poll reconciles */
    }
  }, [dismissPopup]);

  const markAllRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    try {
      await markAllTrainerNotificationsRead();
    } catch {
      /* optimistic update stands; next poll reconciles */
    }
  }, []);

  /** Re-derive unread count from the server (rarely needed; poll already keeps it fresh). */
  const refreshUnreadCount = useCallback(async () => {
    try {
      setUnreadCount(await fetchTrainerUnreadCount());
    } catch {
      /* keep last known count */
    }
  }, []);

  return { notifications, unreadCount, popups, markRead, markAllRead, dismissPopup, refreshUnreadCount };
}
