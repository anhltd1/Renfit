/**
 * localStorage-based customer session.
 * Stores the customer returned by /api/v1/auth/login or /signup, including the
 * opaque session `token` every member API call sends as `Authorization: Bearer`.
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
  token: string;        // session bearer token (issued at login/signup)
}

export function getAuthUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const user = JSON.parse(raw) as AuthUser;
    // Sessions saved before tokens existed can't call the API — treat as logged out.
    return user && typeof user.token === 'string' && user.token ? user : null;
  } catch {
    return null;
  }
}

export function setAuthUser(user: AuthUser): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

/** Bearer header for member API calls (empty when logged out). */
export function customerAuthHeaders(): Record<string, string> {
  const token = getAuthUser()?.token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function clearAuthUser(): void {
  const headers = customerAuthHeaders();
  localStorage.removeItem(STORAGE_KEY);
  // Best-effort server-side revoke so the token is dead even if it was copied.
  if (headers.Authorization && typeof fetch === 'function') {
    const base = import.meta.env.VITE_API_URL ?? '';
    void fetch(`${base}/api/v1/auth/logout`, { method: 'POST', headers }).catch(() => {});
  }
}

export function isAuthenticated(): boolean {
  return getAuthUser() !== null;
}

/**
 * One-shot flag set right after a successful signup, so the dashboard can
 * show the onboarding guide exactly once for brand-new accounts — never on
 * a normal login. Consuming the flag clears it immediately, so a page
 * refresh mid-onboarding won't re-trigger it (acceptable for MVP; the user
 * can always re-open the guide manually if that's added later).
 */
const NEW_ACCOUNT_KEY = 'renfit_new_account';

export function markNewAccount(): void {
  localStorage.setItem(NEW_ACCOUNT_KEY, '1');
}

/** Returns true (and clears the flag) only on the first check after signup. */
export function consumeNewAccountFlag(): boolean {
  const isNew = localStorage.getItem(NEW_ACCOUNT_KEY) === '1';
  if (isNew) localStorage.removeItem(NEW_ACCOUNT_KEY);
  return isNew;
}
