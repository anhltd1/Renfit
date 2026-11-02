import React, { useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { DeviceProvider } from '../../device/DeviceProvider';
import { ConfirmDialog } from './ConfirmDialog';
import { useDirtyGuard } from '../hooks/useDirtyGuard';

describe('ConfirmDialog', () => {
  it('fires onConfirm / onCancel (desktop → Modal)', () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    render(
      <DeviceProvider forceDevice="desktop">
        <ConfirmDialog
          open
          title="Lưu trữ hội viên?"
          body="Hội viên sẽ được chuyển sang Đã nghỉ."
          confirmLabel="Lưu trữ"
          tone="danger"
          onConfirm={onConfirm}
          onCancel={onCancel}
        />
      </DeviceProvider>,
    );
    expect(screen.getByTestId('modal-overlay')).toBeInTheDocument();
    expect(screen.getByRole('dialog', { name: 'Lưu trữ hội viên?' })).toBeInTheDocument();
    expect(screen.getByTestId('confirm-dialog-confirm')).toHaveClass('text-error-text');
    fireEvent.click(screen.getByRole('button', { name: 'Lưu trữ' }));
    expect(onConfirm).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole('button', { name: 'Huỷ' }));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('uses the Sheet on mobile and ignores cancel while busy', () => {
    const onCancel = vi.fn();
    render(
      <DeviceProvider forceDevice="mobile">
        <ConfirmDialog open busy title="Xác nhận" confirmLabel="Đồng ý" onConfirm={() => {}} onCancel={onCancel} />
      </DeviceProvider>,
    );
    expect(screen.getByTestId('sheet-overlay')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('confirm-dialog-cancel'));
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onCancel).not.toHaveBeenCalled();
    expect(screen.getByTestId('confirm-dialog-confirm')).toBeDisabled();
  });

  it('renders nothing when closed and works without a DeviceProvider', () => {
    render(<ConfirmDialog open={false} title="X" confirmLabel="OK" onConfirm={() => {}} onCancel={() => {}} />);
    expect(screen.queryByTestId('confirm-dialog')).toBeNull();
  });
});

function GuardHost({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('An');
  const guard = useDirtyGuard({ name: 'An' }, { name });
  return (
    <>
      <span data-testid="dirty">{String(guard.isDirty)}</span>
      <button onClick={() => setName('Bình')}>edit</button>
      <button onClick={() => guard.requestClose(onClose)}>close</button>
      {guard.dialog}
    </>
  );
}

describe('useDirtyGuard', () => {
  it('closes immediately when clean', () => {
    const onClose = vi.fn();
    render(<GuardHost onClose={onClose} />);
    expect(screen.getByTestId('dirty')).toHaveTextContent('false');
    fireEvent.click(screen.getByText('close'));
    expect(onClose).toHaveBeenCalledOnce();
    expect(screen.queryByTestId('confirm-dialog')).toBeNull();
  });

  it('prompts when dirty; "Tiếp tục sửa" keeps the form, "Bỏ thay đổi" closes', () => {
    const onClose = vi.fn();
    render(<GuardHost onClose={onClose} />);
    fireEvent.click(screen.getByText('edit'));
    expect(screen.getByTestId('dirty')).toHaveTextContent('true');

    fireEvent.click(screen.getByText('close'));
    expect(screen.getByRole('dialog', { name: 'Bỏ thay đổi?' })).toHaveTextContent('Những thay đổi chưa lưu sẽ bị mất.');
    fireEvent.click(screen.getByRole('button', { name: 'Tiếp tục sửa' }));
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.queryByTestId('confirm-dialog')).toBeNull();

    fireEvent.click(screen.getByText('close'));
    fireEvent.click(screen.getByRole('button', { name: 'Bỏ thay đổi' }));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
