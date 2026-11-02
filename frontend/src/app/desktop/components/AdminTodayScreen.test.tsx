import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { AdminTodayScreen } from './AdminTodayScreen';
import * as adminApi from '../../../lib/api/admin';

const refetch = vi.fn();
let todayData: unknown;

vi.mock('../../shared/hooks/useAdminToday', () => ({
  useAdminToday: () => ({
    data: todayData,
    loading: false,
    error: '',
    refetch,
    setPaused: vi.fn(),
  }),
}));

vi.mock('../../components/CalendarKiosk', () => ({
  CalendarKiosk: () => <div data-testid="kiosk-open" />,
}));

vi.mock('../../../lib/api/admin', async () => {
  const actual = await vi.importActual<typeof adminApi>('../../../lib/api/admin');
  return { ...actual, updateBookingStatus: vi.fn() };
});

// 2026-01-05 09:30 ICT
const NOW = new Date('2026-01-05T02:30:00Z');

const sess = (id: string, time: string, name: string, status = 'approved') => ({
  id, time, hour: +time.slice(11, 13), customer_id: name, customer_goal: 'Giảm mỡ', status,
});

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(NOW);
  refetch.mockResolvedValue(undefined);
  todayData = {
    date: '2026-01-05',
    sessions: [],
    unmarked_count: 0,
    pending: [{ id: 'b1', customer_id: 'Lan', time: '2026-01-05T07:00', hour: 7, note: '' }],
  };
});

afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
});

describe('AdminTodayScreen — pending actions (U21 safety net)', () => {
  it('approve shows a success toast', async () => {
    vi.mocked(adminApi.updateBookingStatus).mockResolvedValue(undefined as never);
    render(<AdminTodayScreen />);
    fireEvent.click(screen.getByRole('button', { name: 'Duyệt: Lan' }));
    expect(await screen.findByText('Đã duyệt lịch của Lan.')).toBeInTheDocument();
    expect(adminApi.updateBookingStatus).toHaveBeenCalledWith('b1', 'approved');
    await waitFor(() => expect(refetch).toHaveBeenCalledWith(true));
  });

  it('reject offers undo back to pending', async () => {
    vi.mocked(adminApi.updateBookingStatus).mockResolvedValue(undefined as never);
    render(<AdminTodayScreen />);
    fireEvent.click(screen.getByRole('button', { name: 'Từ chối: Lan' }));
    expect(await screen.findByText('Đã từ chối lịch của Lan.')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('toast-action'));
    await waitFor(() => expect(adminApi.updateBookingStatus).toHaveBeenLastCalledWith('b1', 'pending'));
  });

  it('a failed action shows an error toast and keeps the row', async () => {
    vi.mocked(adminApi.updateBookingStatus).mockRejectedValue(new Error('Lịch đã thay đổi.'));
    render(<AdminTodayScreen />);
    fireEvent.click(screen.getByRole('button', { name: 'Từ chối: Lan' }));
    expect(await screen.findByTestId('toast-err')).toBeInTheDocument();
    expect(screen.getByText('Lan')).toBeInTheDocument();
  });
});

describe('AdminTodayScreen — hub (U23)', () => {
  beforeEach(() => {
    todayData = {
      date: '2026-01-05',
      unmarked_count: 2,
      pending: [
        { id: 'p2', customer_id: 'Mai', time: '2026-01-06T08:00', hour: 8, note: '' },
        { id: 'p1', customer_id: 'Lan', time: '2026-01-05T15:00', hour: 15, note: '' },
      ],
      sessions: [
        sess('s1', '2026-01-05T07:00', 'An', 'completed'),
        sess('s2', '2026-01-05T09:00', 'Binh'),
        sess('s3', '2026-01-05T11:00', 'Chi'),
      ],
    };
  });

  it('hero shows current and next and opens the member on tap', () => {
    const onOpenMember = vi.fn();
    render(<AdminTodayScreen onOpenMember={onOpenMember} />);
    const cur = screen.getByTestId('hero-current');
    expect(cur).toHaveTextContent('Binh');
    expect(cur).toHaveTextContent('Đang tập · còn 30 phút');
    const nxt = screen.getByTestId('hero-next');
    expect(nxt).toHaveTextContent('Chi');
    expect(nxt).toHaveTextContent('Bắt đầu sau 1 giờ 30 phút');
    fireEvent.click(nxt);
    expect(onOpenMember).toHaveBeenCalledWith('Chi');
  });

  it('row body calls onOpenMember', () => {
    const onOpenMember = vi.fn();
    render(<AdminTodayScreen onOpenMember={onOpenMember} />);
    const rows = screen.getAllByTestId('today-session-row');
    fireEvent.click(within(rows[1]).getByRole('button', { name: 'Mở hồ sơ Binh' }));
    expect(onOpenMember).toHaveBeenCalledWith('Binh');
  });

  it('attendance actions only appear on started sessions', () => {
    render(<AdminTodayScreen />);
    const rows = screen.getAllByTestId('today-session-row');
    expect(within(rows[1]).getByTestId('status-action-completed')).toBeInTheDocument(); // started approved
    expect(within(rows[2]).queryByTestId('booking-status-actions')).toBeNull(); // not started
  });

  it('groups pending by day with date headers', () => {
    render(<AdminTodayScreen />);
    const headers = screen.getAllByTestId('pending-day-header').map((h) => h.textContent);
    expect(headers).toEqual(['Hôm nay', 'Ngày mai']);
  });

  it('shows the unmarked chip only when > 0', () => {
    const { unmount } = render(<AdminTodayScreen />);
    expect(screen.getByTestId('unmarked-chip')).toHaveTextContent('Chưa điểm danh: 2');
    unmount();
    (todayData as { unmarked_count: number }).unmarked_count = 0;
    render(<AdminTodayScreen />);
    expect(screen.queryByTestId('unmarked-chip')).toBeNull();
  });

  it('renders headerActions and opens the kiosk', () => {
    render(<AdminTodayScreen headerActions={<button type="button">Thêm</button>} />);
    expect(screen.getByText('Thêm')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Lịch để bàn' }));
    expect(screen.getByTestId('kiosk-open')).toBeInTheDocument();
  });
});
