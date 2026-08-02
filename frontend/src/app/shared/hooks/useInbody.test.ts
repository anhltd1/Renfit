import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import * as profileApi from '../../../lib/api/profile';
import * as adminApi from '../../../lib/api/admin';
import { useInbodyHistory, useAddInbody } from './useInbody';

afterEach(() => vi.restoreAllMocks());

describe('useInbodyHistory', () => {
  it('defaults to the customer (read-only) endpoint', async () => {
    const spy = vi.spyOn(profileApi, 'fetchMyInbody').mockResolvedValue([{ id: '1' }] as any);
    const { result } = renderHook(() => useInbodyHistory('cust-1'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(spy).toHaveBeenCalledWith('cust-1');
    expect(result.current.data).toEqual([{ id: '1' }]);
  });

  it('uses the admin endpoint when viewer="admin"', async () => {
    const spy = vi.spyOn(adminApi, 'fetchInbody').mockResolvedValue([{ id: '2' }] as any);
    const { result } = renderHook(() => useInbodyHistory('cust-1', 'admin'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(spy).toHaveBeenCalledWith('cust-1');
    expect(result.current.data).toEqual([{ id: '2' }]);
  });
});

describe('useAddInbody', () => {
  it('delegates to the admin API', async () => {
    const spy = vi.spyOn(adminApi, 'addInbody').mockResolvedValue({ id: '1' } as any);
    const { result } = renderHook(() => useAddInbody());
    await act(async () => {
      await result.current('cust-1', { height: 170, weight: 65, SMM: 30, BFM: 12 });
    });
    expect(spy).toHaveBeenCalledWith('cust-1', { height: 170, weight: 65, SMM: 30, BFM: 12 });
  });
});
