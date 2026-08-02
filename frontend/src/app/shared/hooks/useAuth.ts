import { useCallback, useState } from 'react';
import { login as apiLogin, signup as apiSignup, type LoginPayload, type SignupPayload } from '../../../lib/api/auth';
import { clearAuthUser, getAuthUser, setAuthUser, type AuthUser } from '../../../lib/auth';

/**
 * Customer auth/session (U2 Shared Data Layer).
 * Wraps lib/api/auth.ts (network) + lib/auth.ts (localStorage session) so
 * components get a reactive `user` instead of reading localStorage directly
 * and needing a manual re-render trigger after login/signup/logout.
 */
export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(() => getAuthUser());

  const login = useCallback(async (payload: LoginPayload): Promise<AuthUser> => {
    const result = await apiLogin(payload);
    setAuthUser(result);
    setUser(result);
    return result;
  }, []);

  const signup = useCallback(async (payload: SignupPayload): Promise<AuthUser> => {
    const result = await apiSignup(payload);
    setAuthUser(result);
    setUser(result);
    return result;
  }, []);

  const logout = useCallback(() => {
    clearAuthUser();
    setUser(null);
  }, []);

  return { user, login, signup, logout };
}
