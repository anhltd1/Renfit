import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DayScroller } from './DayScroller';

const days = [
  { date: '2026-07-20', weekday: 1, label: 'Thứ Hai', slots: [] },
  { date: '2026-07-21', weekday: 2, label: 'Thứ Ba', slots: [] },
] as any;

describe('DayScroller', () => {
  it('renders a button per day', () => {
    render(<DayScroller days={days} selected="2026-07-20" onSelect={vi.fn()} />);
    expect(screen.getByTestId('day-scroller-2026-07-20')).toBeInTheDocument();
    expect(screen.getByTestId('day-scroller-2026-07-21')).toBeInTheDocument();
  });

  it('highlights the selected day', () => {
    render(<DayScroller days={days} selected="2026-07-21" onSelect={vi.fn()} />);
    expect(screen.getByTestId('day-scroller-2026-07-21')).toHaveClass('bg-[#0F6B3E]');
  });

  it('calls onSelect with the tapped date', () => {
    const onSelect = vi.fn();
    render(<DayScroller days={days} selected="2026-07-20" onSelect={onSelect} />);
    fireEvent.click(screen.getByTestId('day-scroller-2026-07-21'));
    expect(onSelect).toHaveBeenCalledWith('2026-07-21');
  });
});
