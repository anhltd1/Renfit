import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { AdminDashboardPage } from './AdminDashboardPage';
import * as adminApi from '../../../lib/api/admin';

vi.mock('../../../lib/api/admin', async () => {
  const actual = await vi.importActual<typeof adminApi>('../../../lib/api/admin');
  return {
    ...actual,
    fetchCustomers: vi.fn(),
    fetchBookings: vi.fn(),
    fetchToday: vi.fn().mockResolvedValue({ date: '2026-08-02', sessions: [], pending: [] }),
    fetchTrainerNotifications: vi.fn().mockResolvedValue([]),
  };
});

afterEach(() => {
  vi.clearAllMocks();
});

const customers: adminApi.CustomerSummary[] = [
  { id: 'Nguyen Van A', phone_number: '0900000001', goal: 'Giảm mỡ', health_note: '', address: '', height: '', weight: '', avatar: '', age: 25 },
];

describe('AdminDashboardPage (mobile)', () => {
  it('renders the customer list on the clients tab', async () => {
    vi.mocked(adminApi.fetchCustomers).mockResolvedValue(customers);
    render(<MemoryRouter><AdminDashboardPage /></MemoryRouter>);
    // Default is "today" tab now — switch to clients
    fireEvent.click(screen.getByTestId('admin-mobile-tab-clients'));
    await waitFor(() => expect(screen.getByText('Nguyen Van A')).toBeInTheDocument());
    expect(screen.getByTestId('admin-mobile-tab-clients')).toBeInTheDocument();
    expect(screen.getByTestId('admin-mobile-tab-bookings')).toBeInTheDocument();
    expect(screen.getByTestId('admin-mobile-tab-today')).toBeInTheDocument();
  });

  it('pushes the detail screen when a customer row is tapped', async () => {
    vi.mocked(adminApi.fetchCustomers).mockResolvedValue(customers);
    render(<MemoryRouter><AdminDashboardPage /></MemoryRouter>);
    fireEvent.click(screen.getByTestId('admin-mobile-tab-clients'));
    await waitFor(() => expect(screen.getByText('Nguyen Van A')).toBeInTheDocument());
    fireEvent.click(screen.getByTestId('admin-mobile-row-Nguyen Van A'));
    expect(screen.getByTestId('stack-header-back')).toBeInTheDocument();
  });

  it('switches to the bookings tab', async () => {
    vi.mocked(adminApi.fetchCustomers).mockResolvedValue(customers);
    vi.mocked(adminApi.fetchBookings).mockResolvedValue({ capacity: 4, days: [] });
    render(<MemoryRouter><AdminDashboardPage /></MemoryRouter>);
    fireEvent.click(screen.getByTestId('admin-mobile-tab-bookings'));
    await waitFor(() => expect(adminApi.fetchBookings).toHaveBeenCalled());
  });
});
