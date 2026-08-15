import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import * as notificationsApi from '../../../lib/api/notifications';
import { useNotifications } from './useNotifications';

beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }));
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('useNotifications', () => {
  it('loads notifications + unread count on mount', async () => {
    vi.spyOn(notificationsApi, 'fetchNotifications').mockResolvedValue([{ id: 'n1', read: false }] as any);
    vi.spyOn(notificationsApi, 'fetchUnreadCount').mockResolvedValue(1);

    const { result } = renderHook(() => useNotifications('cust-1'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual([{ id: 'n1', read: false }]);
    expect(result.current.unreadCount).toBe(1);
  });

  it('refetches on visibility change', async () => {
    const spy = vi.spyOn(notificationsApi, 'fetchNotifications').mockResolvedValue([] as any);
    vi.spyOn(notificationsApi, 'fetchUnreadCount').mockResolvedValue(0);
    renderHook(() => useNotifications('cust-1'));
    await waitFor(() => expect(spy).toHaveBeenCalledTimes(1));

    // Simulate tab becoming visible
    Object.defineProperty(document, 'visibilityState', { value: 'visible', writable: true });
    await act(async () => {
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await waitFor(() => expect(spy).toHaveBeenCalledTimes(2));
  });

  it('markRead refetches the list and unread count', async () => {
    vi.spyOn(notificationsApi, 'fetchNotifications').mockResolvedValue([] as any);
    vi.spyOn(notificationsApi, 'fetchUnreadCount').mockResolvedValue(0);
    const markSpy = vi.spyOn(notificationsApi, 'markNotificationRead').mockResolvedValue(undefined);

    const { result } = renderHook(() => useNotifications('cust-1'));
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.markRead('n1');
    });
    expect(markSpy).toHaveBeenCalledWith('n1', 'cust-1');
  });
});
