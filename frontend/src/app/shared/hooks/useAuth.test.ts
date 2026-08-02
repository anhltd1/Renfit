import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import * as authApi from '../../../lib/api/auth';
import * as auth from '../../../lib/auth';
import { useAuth } from './useAuth';

afterEach(() => vi.restoreAllMocks());

const user = {
  id: 'Nguyen Van A',
  phone_number: '0900000000',
  goal: '',
  health_note: '',
  address: '',
  height: '',
  weight: '',
  avatar: '',
  age: 25,
};

describe('useAuth', () => {
  it('login() persists the session and updates user', async () => {
    vi.spyOn(auth, 'getAuthUser').mockReturnValue(null);
    const setSpy = vi.spyOn(auth, 'setAuthUser').mockImplementation(() => {});
    vi.spyOn(authApi, 'login').mockResolvedValue(user);

    const { result } = renderHook(() => useAuth());
    await act(async () => {
      await result.current.login({ phone_number: '0900000000', password: 'x' });
    });

    expect(setSpy).toHaveBeenCalledWith(user);
    expect(result.current.user).toEqual(user);
  });

  it('logout() clears the session', () => {
    vi.spyOn(auth, 'getAuthUser').mockReturnValue(user);
    const clearSpy = vi.spyOn(auth, 'clearAuthUser').mockImplementation(() => {});
    const { result } = renderHook(() => useAuth());

    act(() => result.current.logout());

    expect(clearSpy).toHaveBeenCalled();
    expect(result.current.user).toBeNull();
  });
});
