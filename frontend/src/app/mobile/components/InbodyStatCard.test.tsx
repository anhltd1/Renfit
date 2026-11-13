import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { InbodyStatCard } from './InbodyStatCard';

describe('InbodyStatCard', () => {
  it('renders label, value, and unit', () => {
    render(<InbodyStatCard label="Cân nặng" value={65} unit="kg" delta={null} />);
    expect(screen.getByText('Cân nặng')).toBeInTheDocument();
    expect(screen.getByText('65,0')).toBeInTheDocument();
  });

  it('shows a body-fat rise as a signed delta in red', () => {
    render(<InbodyStatCard label="BFM" value={14} unit="kg" delta={1.5} goodWhen="down" />);
    const d = screen.getByTestId('inbody-stat-delta');
    expect(d).toHaveTextContent('+1,5 kg');
    expect(d).toHaveClass('text-error-text');
  });

  it('keeps a weight change neutral grey', () => {
    render(<InbodyStatCard label="Cân nặng" value={65} unit="kg" delta={1.5} goodWhen="neutral" />);
    expect(screen.getByTestId('inbody-stat-delta')).toHaveClass('text-white/64');
  });

  it('shows a signed delta in the good green when body fat goes down', () => {
    render(<InbodyStatCard label="BFM" value={12} unit="kg" delta={-2} goodWhen="down" />);
    const d = screen.getByTestId('inbody-stat-delta');
    expect(d).toHaveTextContent('−2,0 kg');
    expect(d).toHaveClass('text-primary-text');
  });

  it('marks a drop in muscle as bad', () => {
    render(<InbodyStatCard label="SMM" value={30} unit="kg" delta={-1} goodWhen="up" />);
    expect(screen.getByTestId('inbody-stat-delta')).toHaveClass('text-error-text');
  });

  it('omits the delta line when delta is null', () => {
    render(<InbodyStatCard label="Chiều cao" value={170} unit="cm" delta={null} />);
    expect(screen.queryByTestId('inbody-stat-delta')).toBeNull();
  });

  it('calls onClick when tapped', () => {
    const onClick = vi.fn();
    render(<InbodyStatCard label="SMM" value={30} unit="kg" delta={0.5} onClick={onClick} />);
    fireEvent.click(screen.getByTestId('inbody-stat-SMM'));
    expect(onClick).toHaveBeenCalledOnce();
  });
});
