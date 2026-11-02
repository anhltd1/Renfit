import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AdminBottomTabBar } from './AdminBottomTabBar';

describe('AdminBottomTabBar', () => {
  it('renders both tabs', () => {
    render(<AdminBottomTabBar active="clients" onChange={vi.fn()} />);
    expect(screen.getByTestId('admin-mobile-tab-clients')).toBeInTheDocument();
    expect(screen.getByTestId('admin-mobile-tab-bookings')).toBeInTheDocument();
  });

  it('highlights the active tab', () => {
    render(<AdminBottomTabBar active="bookings" onChange={vi.fn()} />);
    // U24: green text uses the contrast-safe primary-text token; inactive ≥ white/60.
    expect(screen.getByTestId('admin-mobile-tab-bookings').className).toContain('text-primary-text');
    expect(screen.getByTestId('admin-mobile-tab-clients').className).toContain('text-white/60');
    expect(screen.getByTestId('admin-mobile-tab-bookings')).toHaveAttribute('aria-current', 'page');
    expect(screen.getByTestId('admin-mobile-tab-clients')).not.toHaveAttribute('aria-current');
  });

  it('calls onChange when a tab is tapped', () => {
    const onChange = vi.fn();
    render(<AdminBottomTabBar active="clients" onChange={onChange} />);
    fireEvent.click(screen.getByTestId('admin-mobile-tab-bookings'));
    expect(onChange).toHaveBeenCalledWith('bookings');
  });
});
