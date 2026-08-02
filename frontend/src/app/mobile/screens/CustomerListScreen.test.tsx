import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CustomerListScreen } from './CustomerListScreen';
import * as adminApi from '../../../lib/api/admin';
import type { CustomerSummary } from '../../../lib/api/admin';

vi.mock('../../../lib/api/admin', async () => {
  const actual = await vi.importActual<typeof adminApi>('../../../lib/api/admin');
  return {
    ...actual,
    fetchTrainerNotifications: vi.fn().mockResolvedValue([]),
  };
});

afterEach(() => {
  vi.clearAllMocks();
});

const customers: CustomerSummary[] = [
  { id: 'Nguyen Van A', phone_number: '0900000001', goal: 'Giảm mỡ', health_note: '', address: '', height: '', weight: '', avatar: '', age: 25 },
  { id: 'Tran Thi B', phone_number: '0900000002', goal: 'Tăng cơ', health_note: '', address: '', height: '', weight: '', avatar: '', age: 30 },
];

function renderScreen(overrides: Partial<Parameters<typeof CustomerListScreen>[0]> = {}) {
  const onSearchChange = vi.fn();
  const onSelect = vi.fn();
  const onRefresh = vi.fn();
  const onLogout = vi.fn();
  const onNavigateFromNotification = vi.fn();
  render(
    <CustomerListScreen
      customers={customers}
      loading={false}
      error=""
      search=""
      onSearchChange={onSearchChange}
      onSelect={onSelect}
      onRefresh={onRefresh}
      refreshing={false}
      onLogout={onLogout}
      onNavigateFromNotification={onNavigateFromNotification}
      {...overrides}
    />,
  );
  return { onSearchChange, onSelect, onRefresh, onLogout, onNavigateFromNotification };
}

describe('CustomerListScreen', () => {
  it('renders the customer list', () => {
    renderScreen();
    expect(screen.getByText('Nguyen Van A')).toBeInTheDocument();
    expect(screen.getByText('Tran Thi B')).toBeInTheDocument();
    expect(screen.getByText('2 hội viên')).toBeInTheDocument();
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

  it('calls onRefresh when the refresh button is tapped', () => {
    const { onRefresh } = renderScreen();
    fireEvent.click(screen.getByTestId('admin-mobile-refresh'));
    expect(onRefresh).toHaveBeenCalledOnce();
  });

  it('calls onLogout when the logout button is tapped', () => {
    const { onLogout } = renderScreen();
    fireEvent.click(screen.getByTestId('admin-mobile-logout'));
    expect(onLogout).toHaveBeenCalledOnce();
  });

  it('shows an error message when provided', () => {
    renderScreen({ error: 'Tải dữ liệu thất bại.' });
    expect(screen.getByText('Tải dữ liệu thất bại.')).toBeInTheDocument();
  });
});
