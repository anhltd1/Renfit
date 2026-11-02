import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import { FreshnessIndicator } from './FreshnessIndicator';
import { useFreshness } from '../hooks/useFreshness';

describe('FreshnessIndicator', () => {
  it('shows ICT time when online', () => {
    render(<FreshnessIndicator lastUpdatedAt={new Date('2026-10-31T02:05:00Z')} offline={false} />);
    expect(screen.getByTestId('freshness-updated')).toHaveTextContent('Cập nhật 09:05');
  });
  it('shows offline message', () => {
    render(<FreshnessIndicator lastUpdatedAt={new Date()} offline />);
    expect(screen.getByText('Mất kết nối — đang thử lại')).toBeInTheDocument();
  });
  it('renders nothing before first success', () => {
    const { container } = render(<FreshnessIndicator lastUpdatedAt={null} offline={false} />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe('useFreshness', () => {
  it('goes offline only after a previous success, clears on next success', () => {
    const { result, rerender } = renderHook((p) => useFreshness(p), {
      initialProps: { loading: true, error: '', data: null as unknown },
    });
    expect(result.current.offline).toBe(false);
    rerender({ loading: false, error: 'x', data: null });
    expect(result.current.offline).toBe(false);
    rerender({ loading: false, error: '', data: { a: 1 } });
    expect(result.current.lastUpdatedAt).not.toBeNull();
    rerender({ loading: false, error: 'boom', data: { a: 1 } });
    expect(result.current.offline).toBe(true);
    rerender({ loading: false, error: '', data: { a: 2 } });
    expect(result.current.offline).toBe(false);
  });
});
