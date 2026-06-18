/**
 * Simple localStorage-based auth state (MVP — no JWT).
 * Stores the customer returned by /api/v1/auth/login or /signup.
 */

const STORAGE_KEY = 'renfit_user';

export interface AuthUser {
  id: string;           // Customer.id (full name)
  phone_number: string;
  goal: string;
  health_note: string;
  address: string;
  height: string;
  weight: string;
  avatar: string;
  age: number;
}

export function getAuthUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function setAuthUser(user: AuthUser): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

export function clearAuthUser(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function isAuthenticated(): boolean {
  return getAuthUser() !== null;
}
