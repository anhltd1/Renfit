import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import * as adminApi from '../../../lib/api/admin';
import { useTrainerNotifications } from './useTrainerNotifications';

beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }));
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

const n1 = { id: 'n1', type: 'booking_created', title: 'Lịch mới', message: 'x', target: 'admin:bookings', related_id: 'b1', read: false, created_at: '2026-07-16T10:00:00Z', read_at: null };
const n2 = { id: 'n2', type: 'trainee_registered', title: 'Hội viên mới', message: 'y', target: 'admin:clients', related_id: 'c1', read: false, created_at: '2026-07-16T10:05:00Z', read_at: null };

describe('useTrainerNotifications', () => {
  it('seeds seen ids on first poll without popping toasts for history', async () => {
    vi.spyOn(adminApi, 'fetchTrainerNotifications').mockResolvedValue([n1] as any);
    const { result } = renderHook(() => useTrainerNotifications());
    await waitFor(() => expect(result.current.notifications).toEqual([n1]));
    expect(result.current.popups).toEqual([]);
    expect(result.current.unreadCount).toBe(1);
  });

  it('pushes only newly-seen notifications into the popup queue on refetch', async () => {
    const spy = vi.spyOn(adminApi, 'fetchTrainerNotifications').mockResolvedValueOnce([n1] as any);
    const { result } = renderHook(() => useTrainerNotifications());
    await waitFor(() => expect(result.current.notifications).toEqual([n1]));

    spy.mockResolvedValueOnce([n1, n2] as any);
    // Trigger visibility-based refetch
    Object.defineProperty(document, 'visibilityState', { value: 'visible', writable: true });
    await act(async () => {
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await waitFor(() => expect(result.current.popups).toEqual([n2]));
  });

  it('markRead marks notification read, decrements unread, and dismisses its popup', async () => {
    vi.spyOn(adminApi, 'fetchTrainerNotifications').mockResolvedValue([n1] as any);
    const markSpy = vi.spyOn(adminApi, 'markTrainerNotificationRead').mockResolvedValue(undefined);
    const { result } = renderHook(() => useTrainerNotifications());
    await waitFor(() => expect(result.current.notifications).toEqual([n1]));

    await act(async () => {
      await result.current.markRead('n1');
    });
    expect(markSpy).toHaveBeenCalledWith('n1');
    expect(result.current.unreadCount).toBe(0);
    expect(result.current.notifications[0].read).toBe(true);
  });

  it('dismissPopup removes a popup without marking it read', async () => {
    const spy = vi.spyOn(adminApi, 'fetchTrainerNotifications').mockResolvedValueOnce([n1] as any);
    const markSpy = vi.spyOn(adminApi, 'markTrainerNotificationRead').mockResolvedValue(undefined);
    const { result } = renderHook(() => useTrainerNotifications());
    await waitFor(() => expect(result.current.notifications).toEqual([n1]));

    spy.mockResolvedValueOnce([n1, n2] as any);
    Object.defineProperty(document, 'visibilityState', { value: 'visible', writable: true });
    await act(async () => {
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await waitFor(() => expect(result.current.popups).toEqual([n2]));

    act(() => result.current.dismissPopup('n2'));
    expect(result.current.popups).toEqual([]);
    expect(markSpy).not.toHaveBeenCalled();
  });
});
