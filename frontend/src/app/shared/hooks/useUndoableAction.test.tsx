import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useToast } from './useToast';
import { useUndoableAction } from './useUndoableAction';

let runRef: ReturnType<typeof useUndoableAction>['run'];
let pendingRef = false;
function Host() {
  const { show, node } = useToast();
  const { run, pending } = useUndoableAction(show);
  runRef = run;
  pendingRef = pending;
  return <>{node}</>;
}

describe('useUndoableAction', () => {
  it('runs the action and offers "Hoàn tác"; undo success shows undoneText', async () => {
    const undo = vi.fn().mockResolvedValue(undefined);
    render(<Host />);
    let ok = false;
    await act(async () => {
      ok = await runRef({ action: () => Promise.resolve(), undo, successText: 'Đã từ chối lịch.' });
    });
    expect(ok).toBe(true);
    expect(pendingRef).toBe(false);
    expect(screen.getByTestId('toast-ok')).toHaveTextContent('Đã từ chối lịch.');
    fireEvent.click(screen.getByRole('button', { name: 'Hoàn tác' }));
    await waitFor(() => expect(screen.getByTestId('toast-ok')).toHaveTextContent('Đã hoàn tác.'));
    expect(undo).toHaveBeenCalledOnce();
  });

  it('has no undo button when no undo is given', async () => {
    render(<Host />);
    await act(async () => {
      await runRef({ action: () => Promise.resolve(), successText: 'Đã lưu.' });
    });
    expect(screen.queryByTestId('toast-action')).toBeNull();
  });

  it('shows an error toast when undo fails', async () => {
    render(<Host />);
    await act(async () => {
      await runRef({
        action: () => Promise.resolve(),
        undo: () => Promise.reject(new Error('Không thể khôi phục lịch.')),
        successText: 'Đã từ chối.',
      });
    });
    fireEvent.click(screen.getByRole('button', { name: 'Hoàn tác' }));
    await waitFor(() => expect(screen.getByTestId('toast-err')).toHaveTextContent('Không thể khôi phục lịch.'));
  });

  it('action failure → error toast (Error message), onError, returns false', async () => {
    const onError = vi.fn();
    render(<Host />);
    let ok = true;
    await act(async () => {
      ok = await runRef({
        action: () => Promise.reject(new Error('Khung giờ đã kín.')),
        successText: 'Đã duyệt.',
        onError,
      });
    });
    expect(ok).toBe(false);
    expect(onError).toHaveBeenCalledOnce();
    expect(screen.getByTestId('toast-err')).toHaveTextContent('Khung giờ đã kín.');
  });

  it('falls back to errorText for non-Error rejections', async () => {
    render(<Host />);
    await act(async () => {
      await runRef({ action: () => Promise.reject('x'), successText: 'OK', errorText: 'Không lưu được.' });
    });
    expect(screen.getByTestId('toast-err')).toHaveTextContent('Không lưu được.');
  });
});
