import { memberFetch } from './memberFetch';

const API_BASE = import.meta.env.VITE_API_URL ?? '';

function url(path: string) {
  return API_BASE ? `${API_BASE}${path}` : path;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { detail?: unknown };
    if (typeof err.detail === 'string') throw new Error(err.detail);
    throw new Error('Lỗi server. Vui lòng thử lại.');
  }
  return res.json();
}

export type NotificationType = 'booking_approved' | 'session_reminder' | 'inbody_added';

/**
 * `target` is a "page:tab" string (see backend/docs/notifications.md §4),
 * currently always "dashboard:<tab>" since all customer-facing views live
 * inside UserDashboardPage. Parsed by `parseNotificationTarget` below.
 */
export interface AppNotification {
  id: string;
  customer_id: string;
  type: NotificationType;
  title: string;
  message: string;
  target: string;
  related_id: string;
  read: boolean;
  created_at: string;
  read_at: string | null;
}

export async function fetchNotifications(
  customerId: string,
  unreadOnly = false,
): Promise<AppNotification[]> {
  const params = new URLSearchParams({ customer_id: customerId });
  if (unreadOnly) params.set('unread_only', 'true');
  const res = await memberFetch(url(`/api/v1/notifications?${params.toString()}`));
  return handleResponse<AppNotification[]>(res);
}

export async function fetchUnreadCount(customerId: string): Promise<number> {
  const res = await memberFetch(
    url(`/api/v1/notifications/unread-count?customer_id=${encodeURIComponent(customerId)}`),
  );
  const data = await handleResponse<{ count: number }>(res);
  return data.count;
}

export async function markNotificationRead(
  notificationId: string,
  customerId: string,
): Promise<void> {
  const res = await memberFetch(
    url(
      `/api/v1/notifications/${encodeURIComponent(notificationId)}/read?customer_id=${encodeURIComponent(customerId)}`,
    ),
    { method: 'POST' },
  );
  await handleResponse(res);
}

export async function markAllNotificationsRead(customerId: string): Promise<void> {
  const res = await memberFetch(url('/api/v1/notifications/read-all'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ customer_id: customerId }),
  });
  await handleResponse(res);
}

/** "dashboard:bookings" -> "bookings" (the UserDashboardPage tab key). */
export function parseNotificationTarget(target: string): string | null {
  const [page, tab] = target.split(':');
  if (page !== 'dashboard' || !tab) return null;
  return tab;
}
