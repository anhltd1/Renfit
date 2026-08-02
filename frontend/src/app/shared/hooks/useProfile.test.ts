import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import * as profileApi from '../../../lib/api/profile';
import * as auth from '../../../lib/auth';
import { useProfile } from './useProfile';

const baseUser = {
  id: 'Nguyen Van A',
  phone_number: '0900000000',
  goal: 'Giảm cân',
  health_note: '',
  address: '',
  height: '170',
  weight: '65',
  avatar: '',
  age: 25,
};

beforeEach(() => {
  vi.spyOn(auth, 'getAuthUser').mockReturnValue(baseUser);
  vi.spyOn(auth, 'setAuthUser').mockImplementation(() => {});
});
afterEach(() => vi.restoreAllMocks());

describe('useProfile', () => {
  it('exposes the current user from localStorage', () => {
    const { result } = renderHook(() => useProfile());
    expect(result.current.user).toEqual(baseUser);
  });

  it('update() persists and updates the returned user', async () => {
    const updated = { ...baseUser, goal: 'Tăng cơ' };
    vi.spyOn(profileApi, 'updateProfile').mockResolvedValue(updated);
    const { result } = renderHook(() => useProfile());

    await act(async () => {
      await result.current.update({ customer_id: baseUser.id, goal: 'Tăng cơ' });
    });

    expect(auth.setAuthUser).toHaveBeenCalledWith(updated);
    expect(result.current.user).toEqual(updated);
  });
});
