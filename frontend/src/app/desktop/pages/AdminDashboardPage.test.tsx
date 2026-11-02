import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router';
import { AdminDashboardPage } from './AdminDashboardPage';
import * as adminApi from '../../../lib/api/admin';

vi.mock('../../../lib/api/admin', async () => {
  const actual = await vi.importActual<typeof adminApi>('../../../lib/api/admin');
  return {
    ...actual,
    fetchCustomers: vi.fn(),
    fetchBookings: vi.fn().mockResolvedValue({ capacity: 4, days: [] }),
    fetchToday: vi.fn().mockResolvedValue({ date: '2026-10-27', sessions: [], pending: [] }),
    fetchTrainerNotifications: vi.fn().mockResolvedValue([]),
    fetchInbody: vi.fn().mockResolvedValue([]),
  };
});

afterEach(() => vi.clearAllMocks());

const customers: adminApi.CustomerSummary[] = [
  { id: 'Nguyen Van A', phone_number: '0900000001', goal: '', health_note: '', address: '', height: '', weight: '', avatar: '', age: 25 },
  { id: 'Tran Thi B', phone_number: '0900000002', goal: '', health_note: '', address: '', height: '', weight: '', avatar: '', age: 30 },
];

function LocationProbe() {
  return <p data-testid="location-search">{useLocation().search}</p>;
}

function renderAt(url: string) {
  vi.mocked(adminApi.fetchCustomers).mockResolvedValue(customers);
  return render(
    <MemoryRouter initialEntries={[url]}>
      <AdminDashboardPage />
      <LocationProbe />
    </MemoryRouter>,
  );
}

describe('AdminDashboardPage (desktop) — keeps the open view across a refresh', () => {
  it('reopens the bookings calendar from ?tab=bookings', async () => {
    renderAt('/admin/dashboard?tab=bookings');
    await waitFor(() => expect(adminApi.fetchBookings).toHaveBeenCalled());
    expect(adminApi.fetchToday).not.toHaveBeenCalled();
  });

  it('writes the chosen view into the URL', async () => {
    renderAt('/admin/dashboard');
    fireEvent.click(screen.getByTestId('tab-bookings'));
    await waitFor(() => expect(screen.getByTestId('location-search')).toHaveTextContent('?tab=bookings'));
    fireEvent.click(screen.getByTestId('tab-today'));
    await waitFor(() => expect(screen.getByTestId('location-search')).toBeEmptyDOMElement());
  });

  it('reselects the member from ?member= instead of the first one', async () => {
    renderAt(`/admin/dashboard?tab=clients&member=${encodeURIComponent('Tran Thi B')}`);
    await waitFor(() => expect(adminApi.fetchInbody).toHaveBeenCalledWith('Tran Thi B'));
    expect(adminApi.fetchInbody).not.toHaveBeenCalledWith('Nguyen Van A');
  });
});

describe('AdminDashboardPage (desktop) — U25 session expiry', () => {
  it('sends a 401 to /admin?expired=1', async () => {
    vi.mocked(adminApi.fetchCustomers).mockRejectedValue(new Error('401 Unauthorized'));
    render(
      <MemoryRouter initialEntries={['/admin/dashboard']}>
        <AdminDashboardPage />
        <LocationProbe />
      </MemoryRouter>,
    );
    await waitFor(() => expect(screen.getByTestId('location-search')).toHaveTextContent('?expired=1'));
  });
});
