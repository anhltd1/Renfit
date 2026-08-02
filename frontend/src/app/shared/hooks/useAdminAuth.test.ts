import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import * as adminApi from '../../../lib/api/admin';
import * as adminAuth from '../../../lib/adminAuth';
import { useAdminAuth } from './useAdminAuth';

afterEach(() => vi.restoreAllMocks());

describe('useAdminAuth', () => {
  it('login() persists the token and updates state', async () => {
    vi.spyOn(adminAuth, 'getAdminToken').mockReturnValue(null);
    const setSpy = vi.spyOn(adminAuth, 'setAdminToken').mockImplementation(() => {});
    vi.spyOn(adminApi, 'adminLogin').mockResolvedValue('tok-123');

    const { result } = renderHook(() => useAdminAuth());
    await act(async () => {
      await result.current.login('admin', '123');
    });

    expect(setSpy).toHaveBeenCalledWith('tok-123');
    expect(result.current.token).toBe('tok-123');
  });

  it('logout() clears the token', () => {
    vi.spyOn(adminAuth, 'getAdminToken').mockReturnValue('tok-123');
    const clearSpy = vi.spyOn(adminAuth, 'clearAdminToken').mockImplementation(() => {});
    const { result } = renderHook(() => useAdminAuth());

    act(() => result.current.logout());

    expect(clearSpy).toHaveBeenCalled();
    expect(result.current.token).toBeNull();
  });
});
