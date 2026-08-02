import { useCallback, useState } from 'react';
import { updateProfile, type UpdateProfilePayload } from '../../../lib/api/profile';
import { getAuthUser, setAuthUser, type AuthUser } from '../../../lib/auth';

/**
 * The logged-in customer's profile (U2 Shared Data Layer).
 * Wraps lib/auth.ts (read) + lib/api/profile.ts (write) so components get a
 * reactive `user` value instead of reading localStorage directly.
 */
export function useProfile() {
  const [user, setUser] = useState<AuthUser | null>(() => getAuthUser());

  const update = useCallback(async (payload: UpdateProfilePayload): Promise<AuthUser> => {
    const updated = await updateProfile(payload);
    setAuthUser(updated);
    setUser(updated);
    return updated;
  }, []);

  return { user, update };
}
