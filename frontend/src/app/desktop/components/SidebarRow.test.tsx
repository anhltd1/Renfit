import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SidebarRow } from './SidebarRow';
import type { CustomerSummary } from '../../../lib/api/admin';

const customer: CustomerSummary = {
  id: 'Nguyen Van A',
  phone_number: '0900000000',
  goal: 'Giảm mỡ',
  health_note: '',
  address: '',
  height: '',
  weight: '',
  avatar: '',
  age: 25,
};

describe('SidebarRow', () => {
  it('renders name and goal on two calm lines (phone lives in the detail header)', () => {
    render(<SidebarRow customer={customer} selected={false} onClick={vi.fn()} />);
    expect(screen.getByText('Nguyen Van A')).toBeInTheDocument();
    expect(screen.getByText('Giảm mỡ')).toBeInTheDocument();
    expect(screen.queryByText('0900000000')).toBeNull();
  });

  it('shows the last session as one quiet date and falls back when no goal is set', () => {
    render(
      <SidebarRow
        customer={{ ...customer, goal: '', last_session: '2026-09-09' }}
        selected={false}
        onClick={vi.fn()}
      />,
    );
    expect(screen.getByText('Chưa đặt mục tiêu')).toBeInTheDocument();
    expect(screen.getByText('09/09')).toBeInTheDocument();
  });

  it('marks archived members with plain text, not a pill per row', () => {
    render(<SidebarRow customer={{ ...customer, active: false }} selected={false} onClick={vi.fn()} />);
    expect(screen.getByText('Đã nghỉ')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const onClick = vi.fn();
    render(<SidebarRow customer={customer} selected={false} onClick={onClick} />);
    fireEvent.click(screen.getByTestId(`sidebar-row-${customer.id}`));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('applies the selected style when selected', () => {
    render(<SidebarRow customer={customer} selected onClick={vi.fn()} />);
    expect(screen.getByTestId(`sidebar-row-${customer.id}`).className).toContain('bg-[#0F6B3E]/20');
  });
});
