import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import * as adminApi from '../../../lib/api/admin';
import {
  POLL_INTERVAL_MS,
  useNotificationRefresh,
  useTrainerNotifications,
} from './useTrainerNotifications';

describe('useNotificationRefresh (U25 FR-9)', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('polls every 10 s when push is not active', () => {
    const refetch = vi.fn();
    renderHook(() => useNotificationRefresh(refetch, false));
    expect(refetch).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(POLL_INTERVAL_MS * 2);
    expect(refetch).toHaveBeenCalledTimes(3);
  });

  it('does not poll when push is active; refetches on visibility and push message', () => {
    const listeners: Record<string, (e: MessageEvent) => void> = {};
    const sw = {
      addEventListener: (t: string, fn: (e: MessageEvent) => void) => { listeners[t] = fn; },
      removeEventListener: vi.fn(),
    };
    Object.defineProperty(navigator, 'serviceWorker', { value: sw, configurable: true });
    const refetch = vi.fn();
    renderHook(() => useNotificationRefresh(refetch, true));
    expect(refetch).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(POLL_INTERVAL_MS * 3);
    expect(refetch).toHaveBeenCalledTimes(1);

    document.dispatchEvent(new Event('visibilitychange'));
    expect(refetch).toHaveBeenCalledTimes(2);

    listeners.message({ data: { type: 'push-received' } } as MessageEvent);
    expect(refetch).toHaveBeenCalledTimes(3);
    listeners.message({ data: { type: 'other' } } as MessageEvent);
    expect(refetch).toHaveBeenCalledTimes(3);
  });
});

// ── Original hook behaviour (restored; was overwritten by the U25 test file) ──

const n1 = { id: 'n1', type: 'booking_created', title: 'Lịch mới', message: 'x', target: 'admin:bookings', related_id: 'b1', read: false, created_at: '2026-07-16T10:00:00Z', read_at: null };
const n2 = { id: 'n2', type: 'trainee_registered', title: 'Hội viên mới', message: 'y', target: 'admin:clients', related_id: 'c1', read: false, created_at: '2026-07-16T10:05:00Z', read_at: null };

describe('useTrainerNotifications', () => {
  beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }));
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

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
