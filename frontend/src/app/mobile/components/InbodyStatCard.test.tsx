import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { InbodyStatCard } from './InbodyStatCard';

describe('InbodyStatCard', () => {
  it('renders label, value, and unit', () => {
    render(<InbodyStatCard label="Cân nặng" value={65} unit="kg" delta={null} />);
    expect(screen.getByText('Cân nặng')).toBeInTheDocument();
    expect(screen.getByText('65')).toBeInTheDocument();
  });

  it('shows an up arrow in red for a positive delta', () => {
    render(<InbodyStatCard label="Cân nặng" value={65} unit="kg" delta={1.5} />);
    expect(screen.getByText(/▲/)).toHaveClass('text-red-400');
  });

  it('shows a down arrow in emerald for a negative delta', () => {
    render(<InbodyStatCard label="BFM" value={12} unit="kg" delta={-2} />);
    expect(screen.getByText(/▼/)).toHaveClass('text-emerald-400');
  });

  it('omits the delta line when delta is null', () => {
    render(<InbodyStatCard label="Chiều cao" value={170} unit="cm" delta={null} />);
    expect(screen.queryByText(/▲|▼/)).toBeNull();
  });

  it('calls onClick when tapped', () => {
    const onClick = vi.fn();
    render(<InbodyStatCard label="SMM" value={30} unit="kg" delta={0.5} onClick={onClick} />);
    fireEvent.click(screen.getByTestId('inbody-stat-SMM'));
    expect(onClick).toHaveBeenCalledOnce();
  });
});
