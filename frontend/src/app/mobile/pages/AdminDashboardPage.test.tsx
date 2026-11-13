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

describe('AdminDashboardPage (mobile) — U24 parity', { timeout: 15000 }, () => {
  it('opens a member from Hôm nay and Back returns to Hôm nay', async () => {
    vi.mocked(adminApi.fetchCustomers).mockResolvedValue(customers);
    vi.mocked(adminApi.fetchToday).mockResolvedValue({
      date: '2026-08-02',
      sessions: [{ id: 'b1', time: '2026-08-02T23:00', hour: 23, customer_id: 'Nguyen Van A', customer_goal: '', status: 'approved' }],
      pending: [],
    });
    render(<MemoryRouter><AdminDashboardPage /></MemoryRouter>);
    await waitFor(() => expect(adminApi.fetchCustomers).toHaveBeenCalled());
    const open = await screen.findByRole('button', { name: 'Mở hồ sơ Nguyen Van A' });
    await waitFor(() => expect(open).not.toBeDisabled());
    fireEvent.click(open);
    await waitFor(() => expect(screen.getByTestId('admin-mobile-tab-clients')).toHaveAttribute('aria-current', 'page'));
    expect(screen.getByTestId('customer-detail-edit')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('stack-header-back'));
    expect(screen.getByTestId('admin-mobile-tab-today')).toHaveAttribute('aria-current', 'page');
  });

  it('shows the header actions menu on every tab', async () => {
    vi.mocked(adminApi.fetchCustomers).mockResolvedValue(customers);
    vi.mocked(adminApi.fetchBookings).mockResolvedValue({ capacity: 4, days: [] });
    render(<MemoryRouter><AdminDashboardPage /></MemoryRouter>);
    for (const tab of ['today', 'clients', 'bookings', 'cms']) {
      fireEvent.click(screen.getByTestId(`admin-mobile-tab-${tab}`));
      expect(await screen.findByRole('button', { name: 'Thêm' }), tab).toBeInTheDocument();
    }
  });

  it('Lịch đặt defaults to the day agenda and toggles to the 2-week grid', async () => {
    vi.mocked(adminApi.fetchCustomers).mockResolvedValue(customers);
    vi.mocked(adminApi.fetchBookings).mockResolvedValue({ capacity: 4, days: [] });
    render(<MemoryRouter><AdminDashboardPage /></MemoryRouter>);
    fireEvent.click(screen.getByTestId('admin-mobile-tab-bookings'));
    expect(screen.getByTestId('admin-day-agenda')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('agenda-show-grid'));
    expect(screen.queryByTestId('admin-day-agenda')).toBeNull();
    expect(await screen.findByRole('heading', { name: /Lịch đặt/ })).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('bookings-show-agenda'));
    expect(screen.getByTestId('admin-day-agenda')).toBeInTheDocument();
  });

  it('the root carries .ops-surface', () => {
    vi.mocked(adminApi.fetchCustomers).mockResolvedValue(customers);
    const { container } = render(<MemoryRouter><AdminDashboardPage /></MemoryRouter>);
    expect(container.firstElementChild).toHaveClass('ops-surface');
  });
});

describe('AdminDashboardPage (mobile) — restores the open screen after a refresh', () => {
  it('opens the tab named in ?tab=', async () => {
    vi.mocked(adminApi.fetchCustomers).mockResolvedValue(customers);
    vi.mocked(adminApi.fetchBookings).mockResolvedValue({ capacity: 4, days: [] });
    render(
      <MemoryRouter initialEntries={['/admin/dashboard?tab=bookings']}>
        <AdminDashboardPage />
      </MemoryRouter>,
    );
    expect(screen.getByTestId('admin-mobile-tab-bookings')).toHaveAttribute('aria-current', 'page');
    await waitFor(() => expect(adminApi.fetchBookings).toHaveBeenCalled());
  });

  it("reopens the member's detail screen from ?member=", async () => {
    vi.mocked(adminApi.fetchCustomers).mockResolvedValue(customers);
    render(
      <MemoryRouter initialEntries={[`/admin/dashboard?tab=clients&member=${encodeURIComponent('Nguyen Van A')}`]}>
        <AdminDashboardPage />
      </MemoryRouter>,
    );
    await waitFor(() => expect(screen.getByTestId('stack-header-back')).toBeInTheDocument());
  });

  it('falls back to the default tab for an unknown ?tab=', () => {
    vi.mocked(adminApi.fetchCustomers).mockResolvedValue(customers);
    render(
      <MemoryRouter initialEntries={['/admin/dashboard?tab=nope']}>
        <AdminDashboardPage />
      </MemoryRouter>,
    );
    expect(screen.getByTestId('admin-mobile-tab-today')).toHaveAttribute('aria-current', 'page');
  });
});

describe('AdminDashboardPage (mobile) — U25 session expiry', () => {
  it('sends a 401 to /admin?expired=1', async () => {
    vi.mocked(adminApi.fetchCustomers).mockRejectedValue(new Error('401 Unauthorized'));
    function Probe() {
      return <p data-testid="location-search">{useLocation().pathname + useLocation().search}</p>;
    }
    render(
      <MemoryRouter initialEntries={['/admin/dashboard']}>
        <AdminDashboardPage />
        <Probe />
      </MemoryRouter>,
    );
    await waitFor(() => expect(screen.getByTestId('location-search')).toHaveTextContent('/admin?expired=1'));
  });
});
