import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import * as useInbodyModule from '../../shared/hooks/useInbody';
import { ProgressScreen } from './ProgressScreen';

afterEach(() => vi.restoreAllMocks());

const records = [
  { id: '1', customer_id: 'c1', height: 170, weight: 66, SMM: 29, BFM: 13, date_recorded: '2026-06-01' },
  { id: '2', customer_id: 'c1', height: 170, weight: 65, SMM: 30, BFM: 12, date_recorded: '2026-07-01' },
];

describe('ProgressScreen', () => {
  it('shows the empty state when there are no records', () => {
    vi.spyOn(useInbodyModule, 'useInbodyHistory').mockReturnValue({ data: [], loading: false, error: null, refetch: vi.fn() });
    render(<ProgressScreen customerId="c1" onBack={vi.fn()} />);
    expect(screen.getByText(/Chưa có dữ liệu InBody/)).toBeInTheDocument();
  });

  it('renders 4 stat cards with computed deltas from the latest record', () => {
    vi.spyOn(useInbodyModule, 'useInbodyHistory').mockReturnValue({ data: records, loading: false, error: null, refetch: vi.fn() });
    render(<ProgressScreen customerId="c1" onBack={vi.fn()} />);
    expect(screen.getByTestId('inbody-stat-Cân nặng')).toBeInTheDocument();
    expect(screen.getByTestId('inbody-stat-SMM')).toBeInTheDocument();
    expect(screen.getByTestId('inbody-stat-BFM')).toBeInTheDocument();
    expect(screen.getByTestId('inbody-stat-Chiều cao')).toBeInTheDocument();
  });

  it('switches the active chart metric when a different stat card is tapped', () => {
    vi.spyOn(useInbodyModule, 'useInbodyHistory').mockReturnValue({ data: records, loading: false, error: null, refetch: vi.fn() });
    render(<ProgressScreen customerId="c1" onBack={vi.fn()} />);
    fireEvent.click(screen.getByTestId('inbody-stat-BFM'));
    expect(screen.getByTestId('inbody-stat-BFM')).toHaveClass('border-[#0F6B3E]/60');
  });

  it('calls onBack from the header', () => {
    vi.spyOn(useInbodyModule, 'useInbodyHistory').mockReturnValue({ data: records, loading: false, error: null, refetch: vi.fn() });
    const onBack = vi.fn();
    render(<ProgressScreen customerId="c1" onBack={onBack} />);
    fireEvent.click(screen.getByTestId('stack-header-back'));
    expect(onBack).toHaveBeenCalledOnce();
  });
});
