import { getAdminToken } from '../adminAuth';

const API_BASE = import.meta.env.VITE_API_URL ?? '';

function url(path: string) {
  return API_BASE ? `${API_BASE}${path}` : path;
}

function adminHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getAdminToken() ?? ''}`,
  };
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { detail?: unknown };
    if (typeof err.detail === 'string') throw new Error(err.detail);
    throw new Error('Lỗi server. Vui lòng thử lại.');
  }
  return res.json();
}

export interface CustomerSummary {
  id: string;
  phone_number: string;
  goal: string;
  health_note: string;
  address: string;
  height: string;
  weight: string;
  avatar: string;
  age: number | null;
  active?: boolean;
  last_session?: string | null;
  next_session?: string | null;
}

// ── Today screen ────────────────────────────────────────────────────────────

export interface TodaySession {
  time: string;
  hour: number;
  customer_id: string;
  customer_goal: string;
  status: string;
}

export interface PendingBooking {
  id: string;
  customer_id: string;
  time: string;
  hour: number;
  note: string;
}

export interface TodayData {
  date: string;
  sessions: TodaySession[];
  pending: PendingBooking[];
}

export async function fetchToday(): Promise<TodayData> {
  const res = await fetch(url('/api/v1/admin/today'), {
    headers: adminHeaders(),
  });
  return handleResponse<TodayData>(res);
}

// ── Customers ───────────────────────────────────────────────────────────────

export interface InbodyRecord {
  id: string;
  customer_id: string;
  height: number;
  weight: number;
  SMM: number;
  BFM: number;
  date_recorded: string;
}

export interface AddInbodyPayload {
  height: number;
  weight: number;
  SMM: number;
  BFM: number;
  date_recorded?: string;
}

export async function adminLogin(username: string, password: string): Promise<string> {
  const res = await fetch(url('/api/v1/admin/login'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const data = await handleResponse<{ token: string; name?: string }>(res);
  return data.token;
}

// ── Bookings (trainer view) ─────────────────────────────────────────────────

export type BookingStatus = 'pending' | 'approved' | 'rejected';

export interface AdminBookingItem {
  id: string;
  customer_id: string;
  status: BookingStatus;
  note: string;
}

export interface AdminBookingSlot {
  hour: number;
  time: string;
  bookings: AdminBookingItem[];
  blocked?: boolean;
}

export interface AdminBookingDay {
  date: string;
  weekday: number;
  label: string;
  slots: AdminBookingSlot[];
}

export interface AdminBookings {
  capacity: number;
  days: AdminBookingDay[];
}

export async function fetchBookings(): Promise<AdminBookings> {
  const res = await fetch(url('/api/v1/admin/bookings'), {
    headers: adminHeaders(),
  });
  return handleResponse<AdminBookings>(res);
}

export async function updateBookingStatus(
  bookingId: string,
  status: BookingStatus,
): Promise<{ message: string }> {
  const res = await fetch(url(`/api/v1/admin/bookings/${encodeURIComponent(bookingId)}`), {
    method: 'PATCH',
    headers: adminHeaders(),
    body: JSON.stringify({ status }),
  });
  return handleResponse(res);
}

export async function assignBooking(
  customerId: string,
  time: string,
  note = '',
): Promise<{ message: string }> {
  const res = await fetch(url('/api/v1/admin/bookings/assign'), {
    method: 'POST',
    headers: adminHeaders(),
    body: JSON.stringify({ customer_id: customerId, time, note }),
  });
  return handleResponse(res);
}

// ── Batch booking ───────────────────────────────────────────────────────────

export interface BatchAssignResult {
  time: string;
  success: boolean;
  message: string;
}

export interface BatchAssignResponse {
  results: BatchAssignResult[];
  success_count: number;
  notification_sent: boolean;
}

export async function batchAssign(
  customerId: string,
  times: string[],
): Promise<BatchAssignResponse> {
  const res = await fetch(url('/api/v1/admin/bookings/batch-assign'), {
    method: 'POST',
    headers: adminHeaders(),
    body: JSON.stringify({ customer_id: customerId, times }),
  });
  return handleResponse<BatchAssignResponse>(res);
}

export async function fetchCustomers(): Promise<CustomerSummary[]> {
  const res = await fetch(url('/api/v1/admin/customers'), {
    headers: adminHeaders(),
  });
  return handleResponse<CustomerSummary[]>(res);
}

export interface CreateMemberPayload {
  name: string;
  phone_number: string;
  age: number;
  goal?: string;
  health_note?: string;
  address?: string;
  height?: string;
  weight?: string;
}

export interface CreateMemberResponse extends CustomerSummary {
  temporary_password: string;
}

export async function createMember(payload: CreateMemberPayload): Promise<CreateMemberResponse> {
  const res = await fetch(url('/api/v1/admin/customers'), {
    method: 'POST',
    headers: adminHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse<CreateMemberResponse>(res);
}

export interface EditMemberPayload {
  age?: number;
  goal?: string;
  health_note?: string;
  address?: string;
  height?: string;
  weight?: string;
  avatar?: string;
}

export async function editMember(customerId: string, payload: EditMemberPayload): Promise<CustomerSummary> {
  const res = await fetch(url(`/api/v1/admin/customers/${encodeURIComponent(customerId)}`), {
    method: 'PATCH',
    headers: adminHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse<CustomerSummary>(res);
}

export async function archiveMember(customerId: string): Promise<void> {
  const res = await fetch(url(`/api/v1/admin/customers/${encodeURIComponent(customerId)}/archive`), {
    method: 'POST',
    headers: adminHeaders(),
  });
  await handleResponse(res);
}

export async function restoreMember(customerId: string): Promise<void> {
  const res = await fetch(url(`/api/v1/admin/customers/${encodeURIComponent(customerId)}/restore`), {
    method: 'POST',
    headers: adminHeaders(),
  });
  await handleResponse(res);
}

export async function fetchInbody(customerId: string): Promise<InbodyRecord[]> {
  const res = await fetch(url(`/api/v1/admin/customers/${encodeURIComponent(customerId)}/inbody`), {
    headers: adminHeaders(),
  });
  return handleResponse<InbodyRecord[]>(res);
}

export async function addInbody(customerId: string, payload: AddInbodyPayload): Promise<InbodyRecord> {
  const res = await fetch(url(`/api/v1/admin/customers/${encodeURIComponent(customerId)}/inbody`), {
    method: 'POST',
    headers: adminHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse<InbodyRecord>(res);
}

// ── Notifications (trainer-facing, broadcast) ───────────────────────────────

export type TrainerNotificationType =
  | 'booking_created'
  | 'booking_cancelled'
  | 'trainee_registered';

/**
 * `target` is a "page:tab" string (see backend/docs/notifications.md §4),
 * currently always "admin:<view>" since all trainer-facing views live inside
 * AdminDashboardPage. Parsed by `parseAdminNotificationTarget` below.
 */
export interface TrainerNotification {
  id: string;
  type: TrainerNotificationType;
  title: string;
  message: string;
  target: string;
  related_id: string;
  read: boolean;
  created_at: string;
  read_at: string | null;
}

export async function fetchTrainerNotifications(
  unreadOnly = false,
): Promise<TrainerNotification[]> {
  const params = unreadOnly ? '?unread_only=true' : '';
  const res = await fetch(url(`/api/v1/admin/notifications${params}`), {
    headers: adminHeaders(),
  });
  return handleResponse<TrainerNotification[]>(res);
}

export async function fetchTrainerUnreadCount(): Promise<number> {
  const res = await fetch(url('/api/v1/admin/notifications/unread-count'), {
    headers: adminHeaders(),
  });
  const data = await handleResponse<{ count: number }>(res);
  return data.count;
}

export async function markTrainerNotificationRead(notificationId: string): Promise<void> {
  const res = await fetch(
    url(`/api/v1/admin/notifications/${encodeURIComponent(notificationId)}/read`),
    { method: 'POST', headers: adminHeaders() },
  );
  await handleResponse(res);
}

export async function markAllTrainerNotificationsRead(): Promise<void> {
  const res = await fetch(url('/api/v1/admin/notifications/read-all'), {
    method: 'POST',
    headers: adminHeaders(),
  });
  await handleResponse(res);
}

/** "admin:bookings" -> "bookings" (the AdminDashboardPage view key). */
export function parseAdminNotificationTarget(target: string): string | null {
  const [page, view] = target.split(':');
  if (page !== 'admin' || !view) return null;
  return view;
}


// ── Trainer Notes (per-customer, admin-only) ────────────────────────────────

export interface TrainerNote {
  id: string;
  customer_id: string;
  trainer_id: string;
  content: string;
  created_at: string;
}

export async function fetchNotes(customerId: string): Promise<TrainerNote[]> {
  const res = await fetch(url(`/api/v1/admin/customers/${encodeURIComponent(customerId)}/notes`), {
    headers: adminHeaders(),
  });
  return handleResponse<TrainerNote[]>(res);
}

export async function addNote(customerId: string, content: string): Promise<TrainerNote> {
  const res = await fetch(url(`/api/v1/admin/customers/${encodeURIComponent(customerId)}/notes`), {
    method: 'POST',
    headers: adminHeaders(),
    body: JSON.stringify({ content }),
  });
  return handleResponse<TrainerNote>(res);
}

export async function deleteNote(customerId: string, noteId: string): Promise<void> {
  const res = await fetch(
    url(`/api/v1/admin/customers/${encodeURIComponent(customerId)}/notes/${encodeURIComponent(noteId)}`),
    { method: 'DELETE', headers: adminHeaders() },
  );
  await handleResponse(res);
}

// ── Blocked Slots (admin-only) ──────────────────────────────────────────────

export interface BlockedSlot {
  id: string;
  date: string;
  hours: number[] | 'all';
  reason: string;
  created_at: string;
  created_by: string;
}

export async function fetchBlockedSlots(): Promise<BlockedSlot[]> {
  const res = await fetch(url('/api/v1/admin/blocked-slots'), {
    headers: adminHeaders(),
  });
  return handleResponse<BlockedSlot[]>(res);
}

export async function createBlockedSlot(
  date: string,
  hours: number[] | 'all',
  reason: string,
): Promise<BlockedSlot> {
  const res = await fetch(url('/api/v1/admin/blocked-slots'), {
    method: 'POST',
    headers: adminHeaders(),
    body: JSON.stringify({ date, hours, reason }),
  });
  return handleResponse<BlockedSlot>(res);
}

export async function deleteBlockedSlot(id: string): Promise<void> {
  const res = await fetch(url(`/api/v1/admin/blocked-slots/${encodeURIComponent(id)}`), {
    method: 'DELETE',
    headers: adminHeaders(),
  });
  await handleResponse(res);
}

export async function cancelBlockedSlotBookings(id: string): Promise<{ cancelled: number }> {
  const res = await fetch(url(`/api/v1/admin/blocked-slots/${encodeURIComponent(id)}/cancel-bookings`), {
    method: 'POST',
    headers: adminHeaders(),
  });
  return handleResponse(res);
}
