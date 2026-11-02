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

  describe('compact controls', () => {
    const baseProps = {
      customers,
      selectedId: null,
      search: '',
      onSearchChange: vi.fn(),
      onSelect: vi.fn(),
      loading: false,
      error: '',
    };

    it('uses a filter select and a sort select instead of wrapped chips and pills', () => {
      render(<CustomerSidebar {...baseProps} />);
      expect(screen.getByTestId('select-client-filter')).toHaveValue('active');
      expect(screen.getByTestId('select-client-sort')).toHaveValue('alpha');
      expect(screen.queryByTestId('client-filter-active')).toBeNull();
      expect(screen.getByRole('combobox', { name: 'Lọc hội viên' })).toBeInTheDocument();
      expect(screen.getByRole('combobox', { name: 'Sắp xếp hội viên' })).toBeInTheDocument();
    });

    it('filter select switches to archived members and updates the count', () => {
      const withArchived: CustomerSummary[] = [
        ...customers,
        { id: 'Le Van C', phone_number: '0900000003', goal: '', health_note: '', address: '', height: '', weight: '', avatar: '', age: 40, active: false },
      ];
      render(<CustomerSidebar {...baseProps} customers={withArchived} />);
      expect(screen.queryByText('Le Van C')).toBeNull();
      expect(screen.getByText('2 / 3 hội viên')).toBeInTheDocument();

      fireEvent.change(screen.getByTestId('select-client-filter'), { target: { value: 'archived' } });
      expect(screen.getByText('Le Van C')).toBeInTheDocument();
      expect(screen.queryByText('Nguyen Van A')).toBeNull();
    });

    it('create is a compact icon button with an accessible name', () => {
      const onCreateMember = vi.fn();
      render(<CustomerSidebar {...baseProps} onCreateMember={onCreateMember} />);
      fireEvent.click(screen.getByRole('button', { name: 'Tạo hội viên' }));
      expect(onCreateMember).toHaveBeenCalledOnce();
    });
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
