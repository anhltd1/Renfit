import type { AuthUser } from '../auth';

const API_BASE = import.meta.env.VITE_API_URL ?? '';

export interface SignupPayload {
  name: string;
  phone_number: string;
  password: string;
  age?: number | null;
  goal?: string;
  health_note?: string;
  address?: string;
  height?: string;
  weight?: string;
  avatar?: string;
}

export interface LoginPayload {
  phone_number: string;
  password: string;
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const url = API_BASE ? `${API_BASE}${path}` : path;
  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch (networkErr) {
    // Network failure — backend unreachable, DNS error, CORS preflight blocked, etc.
    console.error('[auth] Network error:', networkErr);
    throw new Error('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.');
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    let err: { detail?: unknown } = {};
    try {
      err = JSON.parse(text) as { detail?: unknown };
    } catch {
      // Response is not JSON (likely a proxy error page)
      console.error(`[auth] Non-JSON error response (${res.status}):`, text.slice(0, 500));
      throw new Error(`Lỗi máy chủ (${res.status}). Vui lòng thử lại.`);
    }

    // FastAPI 422: detail is an array of Pydantic validation errors
    if (Array.isArray(err.detail)) {
      const first = err.detail[0] as { msg?: string; loc?: string[] } | undefined;
      const field = first?.loc?.filter((s) => s !== 'body').join(' → ') ?? '';
      const msg = first?.msg ?? 'Dữ liệu không hợp lệ';
      throw new Error(field ? `${field}: ${msg}` : msg);
    }

    // HTTPException: detail is a plain string
    if (typeof err.detail === 'string') {
      throw new Error(err.detail);
    }

    // Unexpected JSON shape
    console.error(`[auth] Unexpected error shape (${res.status}):`, err);
    throw new Error(`Đã xảy ra lỗi (${res.status}). Vui lòng thử lại.`);
  }

  return res.json();
}

export function signup(payload: SignupPayload): Promise<AuthUser> {
  return post<AuthUser>('/api/v1/auth/signup', payload);
}

export function login(payload: LoginPayload): Promise<AuthUser> {
  return post<AuthUser>('/api/v1/auth/login', payload);
}
