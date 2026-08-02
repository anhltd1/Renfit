import { useCallback, useEffect, useState } from 'react';
import {
  fetchNotifications,
  fetchUnreadCount,
  markAllNotificationsRead,
  markNotificationRead,
  type AppNotification,
} from '../../../lib/api/notifications';
import { useQueryState, usePolling, type QueryState } from './useQuery';

const POLL_INTERVAL_MS = 30000;

/**
 * Customer-facing notifications (U2 Shared Data Layer — wraps lib/api/notifications.ts).
 * Polls every 30s, matching the current NotificationBell.tsx cadence.
 */
export function useNotifications(
  customerId: string,
): QueryState<AppNotification[]> & {
  unreadCount: number;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
} {
  const query = useQueryState(() => fetchNotifications(customerId), [customerId]);
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshUnread = useCallback(async () => {
    try {
      setUnreadCount(await fetchUnreadCount(customerId));
    } catch {
      /* keep the last known count on transient failure */
    }
  }, [customerId]);

  useEffect(() => {
    void refreshUnread();
  }, [refreshUnread]);

  usePolling(async (silent) => {
    await query.refetch(silent);
    await refreshUnread();
  }, POLL_INTERVAL_MS);

  const markRead = useCallback(
    async (id: string) => {
      await markNotificationRead(id, customerId);
      await query.refetch(true);
      await refreshUnread();
    },
    [customerId, query, refreshUnread],
  );

  const markAllRead = useCallback(async () => {
    await markAllNotificationsRead(customerId);
    await query.refetch(true);
    await refreshUnread();
  }, [customerId, query, refreshUnread]);

  return { ...query, unreadCount, markRead, markAllRead };
}
