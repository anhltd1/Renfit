import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LazyLoadFallback } from './LazyLoadFallback';

describe('LazyLoadFallback', () => {
  it('renders an accessible loading indicator', () => {
    render(<LazyLoadFallback />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Đang tải...');
  });
});
