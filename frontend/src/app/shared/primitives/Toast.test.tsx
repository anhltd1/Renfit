import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { Toast } from './Toast';

describe('Toast', () => {
  it('is a polite live region and stays backward compatible without an action', () => {
    render(<Toast kind="ok" text="Đã lưu." />);
    const region = screen.getByRole('status');
    expect(region).toHaveAttribute('aria-live', 'polite');
    expect(region).toHaveClass('pointer-events-none');
    expect(region).toHaveTextContent('Đã lưu.');
    expect(screen.queryByTestId('toast-action')).toBeNull();
  });

  it('renders a clickable action button that takes pointer events', () => {
    const onClick = vi.fn();
    render(<Toast kind="ok" text="Đã từ chối." action={{ label: 'Hoàn tác', onClick }} />);
    const btn = screen.getByRole('button', { name: 'Hoàn tác' });
    expect(btn).toHaveClass('pointer-events-auto', 'tap-target');
    fireEvent.click(btn);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('error toast uses the error-text token, not a raw red fill', () => {
    render(<Toast kind="err" text="Lỗi" />);
    const el = screen.getByTestId('toast-err');
    expect(el.className).toContain('border-error-text');
    expect(el.className).not.toContain('bg-red-500');
  });
});
