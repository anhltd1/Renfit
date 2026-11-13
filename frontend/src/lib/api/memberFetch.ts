import { clearAuthUser, customerAuthHeaders } from '../auth';

/**
 * fetch() for member endpoints: attaches the session bearer token, and on a
 * 401 (expired/revoked session, or an archived member) clears the local
 * session and sends the member back to the login page.
 *
 * Only a request that *carried* a session can trigger the redirect — anonymous
 * visitors (e.g. the public landing page) are never bounced to /login.
 */
export async function memberFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const auth = customerAuthHeaders();
  const res = await fetch(input, {
    ...init,
    headers: { ...(init.headers as Record<string, string> | undefined), ...auth },
  });
  if (res.status === 401 && auth.Authorization) {
    clearAuthUser();
    if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
      window.location.assign('/login');
    }
  }
  return res;
}
