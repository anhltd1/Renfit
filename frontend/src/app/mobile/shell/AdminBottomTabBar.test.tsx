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
    expect(screen.getByTestId('admin-mobile-tab-bookings').className).toContain('text-[#0F6B3E]');
    expect(screen.getByTestId('admin-mobile-tab-clients').className).toContain('text-white/40');
  });

  it('calls onChange when a tab is tapped', () => {
    const onChange = vi.fn();
    render(<AdminBottomTabBar active="clients" onChange={onChange} />);
    fireEvent.click(screen.getByTestId('admin-mobile-tab-bookings'));
    expect(onChange).toHaveBeenCalledWith('bookings');
  });
});
