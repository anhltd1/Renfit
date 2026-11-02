import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BottomTabBar } from './BottomTabBar';

describe('BottomTabBar', () => {
  it('renders all 4 tabs', () => {
    render(<BottomTabBar active="overview" onChange={vi.fn()} />);
    expect(screen.getByTestId('mobile-tab-overview')).toBeInTheDocument();
    expect(screen.getByTestId('mobile-tab-booking')).toBeInTheDocument();
    expect(screen.getByTestId('mobile-tab-coach')).toBeInTheDocument();
    expect(screen.getByTestId('mobile-tab-profile')).toBeInTheDocument();
  });

  it('calls onChange with the tapped tab key', () => {
    const onChange = vi.fn();
    render(<BottomTabBar active="overview" onChange={onChange} />);
    fireEvent.click(screen.getByTestId('mobile-tab-booking'));
    expect(onChange).toHaveBeenCalledWith('booking');
  });

  it('highlights the active tab', () => {
    render(<BottomTabBar active="coach" onChange={vi.fn()} />);
    expect(screen.getByTestId('mobile-tab-coach')).toHaveClass('text-[#0F6B3E]');
    expect(screen.getByTestId('mobile-tab-overview')).toHaveClass('text-white/50');
    expect(screen.getByTestId('mobile-tab-coach')).toHaveAttribute('aria-current', 'page');
  });
});
