import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';

const api = vi.hoisted(() => ({ calls: [] as string[] }));
vi.mock('../../../lib/api/admin', () => ({
  fetchAttendance: async (id: string) => {
    api.calls.push(id);
    return { customer_id: id, completed: 5, no_show: 1 };
  },
}));
import { useAttendance } from './useAttendance';

describe('useAttendance', () => {
  beforeEach(() => { api.calls = []; });

  it('fetches the summary for a customer and refetches when the id changes', async () => {
    const { result, rerender } = renderHook(({ id }) => useAttendance(id), { initialProps: { id: 'Lan' } });
    await waitFor(() => expect(result.current.data).toEqual({ customer_id: 'Lan', completed: 5, no_show: 1 }));
    rerender({ id: 'Minh' });
    await waitFor(() => expect(result.current.data?.customer_id).toBe('Minh'));
    expect(api.calls).toEqual(['Lan', 'Minh']);
  });

  it('does not call the API without an id', async () => {
    const { result } = renderHook(() => useAttendance(null));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toBeNull();
    expect(api.calls).toEqual([]);
  });
});
