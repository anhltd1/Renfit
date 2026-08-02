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
