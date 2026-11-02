import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router';
import { useState } from 'react';
import { AdminDayAgenda, canAssign, occupiedCount } from './AdminDayAgenda';
import { buildScrollerDays } from '../components/AdminDayScroller';
import { DeviceProvider } from '../../device/DeviceProvider';
import { ictDateString } from '../../shared/clients/clientFilters';
import { AdminDashboardPage } from '../pages/AdminDashboardPage';
import * as adminApi from '../../../lib/api/admin';
import type { AdminBookingDay, AdminBookings, CustomerSummary } from '../../../lib/api/admin';

vi.mock('../../../lib/api/admin', async () => {
  const actual = await vi.importActual<typeof adminApi>('../../../lib/api/admin');
  return {
    ...actual,
    fetchBookings: vi.fn(),
    fetchCustomers: vi.fn(),
    assignBooking: vi.fn(async () => ({ message: 'ok' })),
    fetchToday: vi.fn(async () => ({ date: '', sessions: [], pending: [] })),
    fetchTrainerNotifications: vi.fn(async () => []),
    fetchTrainerUnreadCount: vi.fn(async () => 0),
  };
});

afterEach(() => vi.clearAllMocks());

const DAY_MS = 86_400_000;
const TODAY = ictDateString();

function addDays(iso: string, n: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d) + n * DAY_MS).toISOString().slice(0, 10);
}
const isSunday = (iso: string) => new Date(`${iso}T00:00:00Z`).getUTCDay() === 0;

/** Working days from today (today included even if it is a Sunday is skipped). */
function windowDates(count = 12): string[] {
  const out: string[] = [];
  for (let i = 0; out.length < count; i++) {
    const iso = addDays(TODAY, i);
    if (!isSunday(iso)) out.push(iso);
  }
  return out;
}

function mkDay(date: string): AdminBookingDay {
  return {
    date,
    weekday: new Date(`${date}T00:00:00Z`).getUTCDay(),
    label: date,
    slots: Array.from({ length: 12 }, (_, i) => {
      const hour = 8 + i;
      const time = `${date}T${String(hour).padStart(2, '0')}:00`;
      if (hour === 9) return { hour, time, bookings: [], blocked: true };
      if (hour === 10)
        return {
          hour,
          time,
          bookings: ['a', 'b', 'c', 'd'].map((x) => ({ id: `${date}-${x}`, customer_id: `Hội viên ${x}`, status: 'approved' as const, note: '' })),
        };
      if (hour === 8)
        return { hour, time, bookings: [{ id: `${date}-p`, customer_id: 'Nguyen Van A', status: 'pending' as const, note: '' }] };
      return { hour, time, bookings: [] };
    }),
  };
}

const DATES = windowDates();
const DATA: AdminBookings = { capacity: 4, days: DATES.map(mkDay) };
const FIRST = DATES[0];
const SECOND = DATES[1];

const customers: CustomerSummary[] = [
  { id: 'Nguyen Van A', phone_number: '0900000001', goal: '', health_note: '', address: '', height: '', weight: '', avatar: '', age: 25 },
  { id: 'Tran Thi B', phone_number: '0911222333', goal: '', health_note: '', address: '', height: '', weight: '', avatar: '', age: 30 },
];

function Harness({ initialDay = FIRST }: { initialDay?: string }) {
  const [day, setDay] = useState(initialDay);
  return (
    <DeviceProvider forceDevice="mobile">
      <AdminDayAgenda day={day} today={TODAY} onDayChange={setDay} onShowGrid={vi.fn()} />
    </DeviceProvider>
  );
}

describe('AdminDayAgenda helpers (example-based)', () => {
  it('occupancy ignores rejected bookings; blocked or full slots cannot be assigned', () => {
    const b = (status: adminApi.BookingStatus) => ({ id: status, customer_id: 'x', status, note: '' });
    expect(occupiedCount([b('approved'), b('rejected'), b('no_show'), b('completed')])).toBe(3);
    expect(canAssign({ hour: 8, time: '', bookings: [] }, 4)).toBe(true);
    expect(canAssign({ hour: 8, time: '', bookings: [], blocked: true }, 4)).toBe(false);
    expect(canAssign({ hour: 8, time: '', bookings: [b('approved'), b('approved'), b('approved'), b('approved')] }, 4)).toBe(false);
    expect(canAssign({ hour: 8, time: '', bookings: [b('approved'), b('approved'), b('approved'), b('rejected')] }, 4)).toBe(true);
  });

  it('buildScrollerDays fills in Sundays between working days', () => {
    // 2026-08-08 is a Saturday, 2026-08-10 a Monday
    expect(buildScrollerDays(['2026-08-10', '2026-08-08'])).toEqual([
      { date: '2026-08-08', sunday: false },
      { date: '2026-08-09', sunday: true },
      { date: '2026-08-10', sunday: false },
    ]);
    expect(buildScrollerDays([])).toEqual([]);
  });
});

describe('AdminDayAgenda', { timeout: 15000 }, () => {
  it('renders hours 08–19 with counts, bookings, blocked and full states', async () => {
    vi.mocked(adminApi.fetchBookings).mockResolvedValue(DATA);
    render(<Harness />);
    await screen.findByTestId('agenda-hour-8');
    for (let h = 8; h <= 19; h++) expect(screen.getByTestId(`agenda-hour-${h}`)).toBeInTheDocument();
    expect(screen.getByTestId('agenda-count-8')).toHaveTextContent('1/4');
    expect(screen.getByTestId('agenda-count-10')).toHaveTextContent('4/4');
    expect(screen.queryByTestId('agenda-assign-10')).toBeNull(); // full
    expect(screen.getByTestId('agenda-assign-11')).toBeInTheDocument();
    expect(within(screen.getByTestId('agenda-hour-8')).getByTestId('status-badge-pending')).toBeInTheDocument();
    // Pending count across the window
    expect(screen.getByTestId('agenda-pending-count')).toHaveTextContent(`Chờ duyệt: ${DATES.length}`);
  });

  it('a blocked hour shows "Đã chặn" and nothing tappable', async () => {
    vi.mocked(adminApi.fetchBookings).mockResolvedValue(DATA);
    render(<Harness />);
    const row = await screen.findByTestId('agenda-hour-9');
    expect(within(row).getByTestId('agenda-blocked-9')).toHaveTextContent('Đã chặn');
    expect(within(row).queryAllByRole('button')).toHaveLength(0);
  });

  it('"+ Đặt lịch" opens the assign sheet; picking a member books the slot', async () => {
    vi.mocked(adminApi.fetchBookings).mockResolvedValue(DATA);
    vi.mocked(adminApi.fetchCustomers).mockResolvedValue(customers);
    render(<Harness />);
    fireEvent.click(await screen.findByTestId('agenda-assign-11'));
    expect(screen.getByTestId('assign-booking-sheet')).toBeInTheDocument();
    // search by phone
    fireEvent.change(screen.getByTestId('input-assign-search'), { target: { value: '0911' } });
    fireEvent.click(await screen.findByTestId('assign-option-Tran Thi B'));
    expect(screen.queryByTestId('assign-option-Nguyen Van A')).toBeNull();
    fireEvent.click(screen.getByTestId('assign-submit'));
    await waitFor(() => expect(adminApi.assignBooking).toHaveBeenCalledWith('Tran Thi B', `${FIRST}T11:00`));
    expect(await screen.findByText('Đã đặt lịch tập cho Tran Thi B.')).toBeInTheDocument();
    expect(screen.queryByTestId('assign-booking-sheet')).toBeNull();
  });

  it('tapping a booking opens the status sheet with actions', async () => {
    vi.mocked(adminApi.fetchBookings).mockResolvedValue(DATA);
    render(<Harness />);
    fireEvent.click(await screen.findByTestId(`agenda-booking-${FIRST}-p`));
    const sheet = screen.getByTestId('agenda-status-sheet');
    expect(within(sheet).getByTestId('status-action-approved')).toBeInTheDocument();
    expect(within(sheet).getByTestId('status-action-rejected')).toBeInTheDocument();
  });

  it('day scroller switches days and labels today', async () => {
    vi.mocked(adminApi.fetchBookings).mockResolvedValue(DATA);
    render(<Harness />);
    await screen.findByTestId('agenda-hour-8');
    if (FIRST === TODAY) expect(screen.getByTestId(`admin-day-${TODAY}`)).toHaveTextContent('Hôm nay');
    fireEvent.click(screen.getByTestId(`admin-day-${SECOND}`));
    expect(screen.getByTestId(`admin-day-${SECOND}`)).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByTestId(`agenda-booking-${SECOND}-p`)).toBeInTheDocument();
    // Sundays in the window are "Nghỉ" and not selectable
    const sunday = buildScrollerDays(DATES).find((d) => d.sunday);
    if (sunday) {
      expect(screen.getByTestId(`admin-day-${sunday.date}`)).toBeDisabled();
      expect(screen.getByTestId(`admin-day-${sunday.date}`)).toHaveTextContent('Nghỉ');
    }
  });
});

function LocationProbe() {
  const loc = useLocation();
  return <span data-testid="location-search">{loc.search}</span>;
}

describe('AdminDayAgenda URL key `day` (via the mobile page)', { timeout: 15000 }, () => {
  it('restores ?day= and writes it back; the default day is omitted', async () => {
    vi.mocked(adminApi.fetchBookings).mockResolvedValue(DATA);
    vi.mocked(adminApi.fetchCustomers).mockResolvedValue(customers);
    const target = DATES[2];
    render(
      <DeviceProvider forceDevice="mobile">
        <MemoryRouter initialEntries={[`/admin/dashboard?tab=bookings&day=${target}`]}>
          <AdminDashboardPage />
          <LocationProbe />
        </MemoryRouter>
      </DeviceProvider>,
    );
    await waitFor(() => expect(screen.getByTestId(`admin-day-${target}`)).toHaveAttribute('aria-pressed', 'true'));
    expect(screen.getByTestId('location-search').textContent).toContain(`day=${target}`);

    // Choose today (or the first working day when today is a Sunday)
    const todayBtn = screen.queryByTestId(`admin-day-${TODAY}`);
    if (todayBtn && !isSunday(TODAY)) {
      fireEvent.click(todayBtn);
      await waitFor(() => expect(screen.getByTestId('location-search').textContent).not.toContain('day='));
    }
  });
});
