const STORAGE_KEY = 'renfit_admin';

export function getAdminToken(): string | null {
  return localStorage.getItem(STORAGE_KEY);
}

export function setAdminToken(token: string): void {
  localStorage.setItem(STORAGE_KEY, token);
}

export function clearAdminToken(): void {
  const token = getAdminToken();
  localStorage.removeItem(STORAGE_KEY);
  // Best-effort server-side revoke so the token is dead even if it was copied.
  if (token && typeof fetch === 'function') {
    const base = import.meta.env.VITE_API_URL ?? '';
    void fetch(`${base}/api/v1/admin/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {});
  }
}

export function isAdminAuthenticated(): boolean {
  return getAdminToken() !== null;
}
