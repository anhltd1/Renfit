const STORAGE_KEY = 'renfit_admin';

export function getAdminToken(): string | null {
  return localStorage.getItem(STORAGE_KEY);
}

export function setAdminToken(token: string): void {
  localStorage.setItem(STORAGE_KEY, token);
}

export function clearAdminToken(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function isAdminAuthenticated(): boolean {
  return getAdminToken() !== null;
}
