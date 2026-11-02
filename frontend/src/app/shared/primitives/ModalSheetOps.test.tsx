import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Modal } from './Modal';
import { Sheet } from './Sheet';

describe('Modal / Sheet ops prop (U25)', () => {
  it('Modal adds ops-surface only when ops, and close button is a tap target', () => {
    const { rerender } = render(<Modal open onClose={vi.fn()} title="T">x</Modal>);
    expect(screen.getByRole('dialog')).not.toHaveClass('ops-surface');
    expect(screen.getByTestId('modal-close')).toHaveClass('tap-target');
    rerender(<Modal open onClose={vi.fn()} title="T" ops>x</Modal>);
    expect(screen.getByRole('dialog')).toHaveClass('ops-surface');
  });

  it('Sheet adds ops-surface only when ops', () => {
    const { rerender } = render(<Sheet open onClose={vi.fn()} title="T">x</Sheet>);
    expect(screen.getByRole('dialog')).not.toHaveClass('ops-surface');
    rerender(<Sheet open onClose={vi.fn()} title="T" ops>x</Sheet>);
    expect(screen.getByRole('dialog')).toHaveClass('ops-surface');
  });
});
