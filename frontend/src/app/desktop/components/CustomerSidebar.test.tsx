import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CustomerSidebar } from './CustomerSidebar';
import type { CustomerSummary } from '../../../lib/api/admin';

const customers: CustomerSummary[] = [
  { id: 'Nguyen Van A', phone_number: '0900000001', goal: 'Giảm mỡ', health_note: '', address: '', height: '', weight: '', avatar: '', age: 25 },
  { id: 'Tran Thi B', phone_number: '0900000002', goal: 'Tăng cơ', health_note: '', address: '', height: '', weight: '', avatar: '', age: 30 },
];

describe('CustomerSidebar', () => {
  it('renders the customer list and count footer', () => {
    render(
      <CustomerSidebar
        customers={customers}
        selectedId={null}
        search=""
        onSearchChange={vi.fn()}
        onSelect={vi.fn()}
        loading={false}
        error=""
      />,
    );
    expect(screen.getByText('Nguyen Van A')).toBeInTheDocument();
    expect(screen.getByText('Tran Thi B')).toBeInTheDocument();
    expect(screen.getByText('2 hội viên')).toBeInTheDocument();
  });

  it('filters the list by search term', () => {
    render(
      <CustomerSidebar
        customers={customers}
        selectedId={null}
        search="Tran"
        onSearchChange={vi.fn()}
        onSelect={vi.fn()}
        loading={false}
        error=""
      />,
    );
    expect(screen.queryByText('Nguyen Van A')).toBeNull();
    expect(screen.getByText('Tran Thi B')).toBeInTheDocument();
  });

  it('calls onSelect when a row is clicked', () => {
    const onSelect = vi.fn();
    render(
      <CustomerSidebar
        customers={customers}
        selectedId={null}
        search=""
        onSearchChange={vi.fn()}
        onSelect={onSelect}
        loading={false}
        error=""
      />,
    );
    fireEvent.click(screen.getByTestId('sidebar-row-Nguyen Van A'));
    expect(onSelect).toHaveBeenCalledWith(customers[0]);
  });

  it('shows loading spinner and hides list while loading', () => {
    render(
      <CustomerSidebar
        customers={[]}
        selectedId={null}
        search=""
        onSearchChange={vi.fn()}
        onSelect={vi.fn()}
        loading
        error=""
      />,
    );
    expect(screen.queryByText('Chưa có hội viên.')).toBeNull();
  });

  it('shows an error message when provided', () => {
    render(
      <CustomerSidebar
        customers={[]}
        selectedId={null}
        search=""
        onSearchChange={vi.fn()}
        onSelect={vi.fn()}
        loading={false}
        error="Tải dữ liệu thất bại."
      />,
    );
    expect(screen.getByText('Tải dữ liệu thất bại.')).toBeInTheDocument();
  });

  it('calls onSearchChange when typing in the search input', () => {
    const onSearchChange = vi.fn();
    render(
      <CustomerSidebar
        customers={customers}
        selectedId={null}
        search=""
        onSearchChange={onSearchChange}
        onSelect={vi.fn()}
        loading={false}
        error=""
      />,
    );
    fireEvent.change(screen.getByTestId('input-customer-search'), { target: { value: 'Nguyen' } });
    expect(onSearchChange).toHaveBeenCalledWith('Nguyen');
  });
});
