import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router';
import { CustomerListScreen } from './CustomerListScreen';
import type { CustomerSummary } from '../../../lib/api/admin';

afterEach(() => {
  vi.clearAllMocks();
});

const customers: CustomerSummary[] = [
  { id: 'Nguyen Van A', phone_number: '0900000001', goal: 'Giảm mỡ', health_note: '', address: '', height: '', weight: '', avatar: '', age: 25 },
  { id: 'Tran Thi B', phone_number: '0900000002', goal: 'Tăng cơ', health_note: '', address: '', height: '', weight: '', avatar: '', age: 30 },
  { id: 'Le Van C', phone_number: '0900000003', goal: '', health_note: '', address: '', height: '', weight: '', avatar: '', age: 40, active: false },
];

function LocationProbe() {
  const loc = useLocation();
  return <span data-testid="location-search">{loc.search}</span>;
}

function renderScreen(overrides: Partial<Parameters<typeof CustomerListScreen>[0]> = {}, url = '/admin/dashboard?tab=clients') {
  const onSearchChange = vi.fn();
  const onSelect = vi.fn();
  const onRefresh = vi.fn();
  render(
    <MemoryRouter initialEntries={[url]}>
      <CustomerListScreen
        customers={customers}
        loading={false}
        error=""
        search=""
        onSearchChange={onSearchChange}
        onSelect={onSelect}
        onRefresh={onRefresh}
        headerActions={<button type="button">Thêm</button>}
        {...overrides}
      />
      <LocationProbe />
    </MemoryRouter>,
  );
  return { onSearchChange, onSelect, onRefresh };
}

describe('CustomerListScreen', () => {
  it('renders active members by default (archived hidden)', () => {
    renderScreen();
    expect(screen.getByText('Nguyen Van A')).toBeInTheDocument();
    expect(screen.getByText('Tran Thi B')).toBeInTheDocument();
    expect(screen.queryByText('Le Van C')).toBeNull();
    expect(screen.getByText('2 / 3 hội viên')).toBeInTheDocument();
    expect(screen.getByTestId('client-filter-active')).toHaveAttribute('aria-pressed', 'true');
  });

  it('renders the header actions slot', () => {
    renderScreen();
    expect(screen.getByRole('button', { name: 'Thêm' })).toBeInTheDocument();
  });

  it('calls onSelect when a row is tapped', () => {
    const { onSelect } = renderScreen();
    fireEvent.click(screen.getByTestId('admin-mobile-row-Nguyen Van A'));
    expect(onSelect).toHaveBeenCalledWith(customers[0]);
  });

  it('calls onSearchChange when typing', () => {
    const { onSearchChange } = renderScreen();
    fireEvent.change(screen.getByTestId('admin-mobile-search'), { target: { value: 'Tran' } });
    expect(onSearchChange).toHaveBeenCalledWith('Tran');
  });

  it('Đã nghỉ chip shows archived members with a marker and writes ?filter=', () => {
    renderScreen();
    fireEvent.click(screen.getByTestId('client-filter-archived'));
    expect(screen.getByText('Le Van C')).toBeInTheDocument();
    expect(screen.getByTestId('admin-mobile-row-archived-Le Van C')).toHaveTextContent('Đã nghỉ');
    expect(screen.queryByText('Nguyen Van A')).toBeNull();
    expect(screen.getByTestId('location-search').textContent).toContain('filter=archived');

    fireEvent.click(screen.getByTestId('client-filter-active'));
    expect(screen.getByTestId('location-search').textContent).not.toContain('filter=');
  });

  it('restores the filter from the URL', () => {
    renderScreen({}, '/admin/dashboard?tab=clients&filter=archived');
    expect(screen.getByTestId('client-filter-archived')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('Le Van C')).toBeInTheDocument();
  });

  it('offers the desktop sort options', () => {
    renderScreen({
      customers: [
        { ...customers[0], next_session: '2026-09-02T08:00' },
        { ...customers[1], next_session: '2026-09-01T08:00' },
      ],
    });
    const rows = () => screen.getAllByTestId(/^admin-mobile-row-(?!archived)/).map((r) => r.getAttribute('data-testid'));
    expect(rows()).toEqual(['admin-mobile-row-Nguyen Van A', 'admin-mobile-row-Tran Thi B']);
    fireEvent.click(screen.getByTestId('admin-mobile-sort-nextSession'));
    expect(screen.getByTestId('admin-mobile-sort-nextSession')).toHaveAttribute('aria-pressed', 'true');
    expect(rows()).toEqual(['admin-mobile-row-Tran Thi B', 'admin-mobile-row-Nguyen Van A']);
  });

  it('shows an error message when provided', () => {
    renderScreen({ error: 'Tải dữ liệu thất bại.' });
    expect(screen.getByText('Tải dữ liệu thất bại.')).toBeInTheDocument();
  });
});
