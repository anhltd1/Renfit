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
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { detail?: unknown };

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

    throw new Error('Đã xảy ra lỗi. Vui lòng thử lại.');
  }

  return res.json();
}

export function signup(payload: SignupPayload): Promise<AuthUser> {
  return post<AuthUser>('/api/v1/auth/signup', payload);
}

export function login(payload: LoginPayload): Promise<AuthUser> {
  return post<AuthUser>('/api/v1/auth/login', payload);
}
