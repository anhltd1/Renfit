import { useCallback, useState } from 'react';
import { adminLogin } from '../../../lib/api/admin';
import { clearAdminToken, getAdminToken, setAdminToken } from '../../../lib/adminAuth';

/**
 * Trainer/admin auth/session (U2 Shared Data Layer).
 * Wraps lib/api/admin.ts::adminLogin (network) + lib/adminAuth.ts (localStorage
 * bearer token) so components get a reactive `token` instead of reading
 * localStorage directly.
 */
export function useAdminAuth() {
  const [token, setToken] = useState<string | null>(() => getAdminToken());

  const login = useCallback(async (username: string, password: string): Promise<string> => {
    const result = await adminLogin(username, password);
    setAdminToken(result);
    setToken(result);
    return result;
  }, []);

  const logout = useCallback(() => {
    clearAdminToken();
    setToken(null);
  }, []);

  return { token, login, logout };
}
