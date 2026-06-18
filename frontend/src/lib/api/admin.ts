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
}

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

export async function fetchCustomers(): Promise<CustomerSummary[]> {
  const res = await fetch(url('/api/v1/admin/customers'), {
    headers: adminHeaders(),
  });
  return handleResponse<CustomerSummary[]>(res);
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
