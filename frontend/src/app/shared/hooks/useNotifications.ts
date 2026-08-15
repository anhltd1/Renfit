import { useCallback, useEffect, useState } from 'react';
import {
  fetchNotifications,
  fetchUnreadCount,
  markAllNotificationsRead,
  markNotificationRead,
  type AppNotification,
} from '../../../lib/api/notifications';
import { useQueryState, type QueryState } from './useQuery';

/**
 * Customer-facing notifications (U2 Shared Data Layer — wraps lib/api/notifications.ts).
 * Push replaces polling (U17). Refetches on visibility change (tab focus) as fallback.
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

  // Refetch on tab focus (lightweight fallback for push)
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        query.refetch(true);
        refreshUnread();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [query, refreshUnread]);

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
