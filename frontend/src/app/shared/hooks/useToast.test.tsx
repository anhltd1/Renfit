import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { useToast, type UseToastResult } from './useToast';

let api: UseToastResult;
function Host() {
  api = useToast();
  return <>{api.node}</>;
}

describe('useToast', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('shows a toast and auto-hides after 3.5 s by default', () => {
    render(<Host />);
    act(() => api.show({ kind: 'ok', text: 'Đã lưu.' }));
    expect(screen.getByTestId('toast-ok')).toHaveTextContent('Đã lưu.');
    act(() => vi.advanceTimersByTime(3499));
    expect(screen.queryByTestId('toast-ok')).not.toBeNull();
    act(() => vi.advanceTimersByTime(1));
    expect(screen.queryByTestId('toast-ok')).toBeNull();
  });

  it('keeps action toasts for 5 s', () => {
    render(<Host />);
    act(() => api.show({ kind: 'ok', text: 'Đã từ chối.', action: { label: 'Hoàn tác', onClick: () => {} } }));
    act(() => vi.advanceTimersByTime(4999));
    expect(screen.queryByTestId('toast-ok')).not.toBeNull();
    act(() => vi.advanceTimersByTime(1));
    expect(screen.queryByTestId('toast-ok')).toBeNull();
  });

  it('replaces the visible toast and restarts the timer', () => {
    render(<Host />);
    act(() => api.show({ kind: 'ok', text: 'Một' }));
    act(() => vi.advanceTimersByTime(3000));
    act(() => api.show({ kind: 'err', text: 'Hai' }));
    expect(screen.queryByTestId('toast-ok')).toBeNull();
    expect(screen.getByTestId('toast-err')).toHaveTextContent('Hai');
    act(() => vi.advanceTimersByTime(3000));
    expect(screen.queryByTestId('toast-err')).not.toBeNull();
  });

  it('action click hides the toast and runs the handler', () => {
    const onClick = vi.fn();
    render(<Host />);
    act(() => api.show({ kind: 'ok', text: 'Xong', action: { label: 'Hoàn tác', onClick } }));
    fireEvent.click(screen.getByTestId('toast-action'));
    expect(onClick).toHaveBeenCalledOnce();
    expect(screen.queryByTestId('toast-ok')).toBeNull();
  });

  it('hide() removes the toast', () => {
    render(<Host />);
    act(() => api.show({ kind: 'ok', text: 'X', durationMs: 10_000 }));
    act(() => api.hide());
    expect(api.toast).toBeNull();
    expect(screen.queryByTestId('toast-ok')).toBeNull();
  });
});
