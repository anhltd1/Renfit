import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { OverviewScreen } from './OverviewScreen';

vi.mock('../../../lib/api/notifications', () => ({
  fetchNotifications: vi.fn().mockResolvedValue([]),
  fetchUnreadCount: vi.fn().mockResolvedValue(0),
  markNotificationRead: vi.fn(),
  markAllNotificationsRead: vi.fn(),
  parseNotificationTarget: () => null,
}));

vi.mock('../../../lib/api/bookings', () => ({
  fetchAvailability: vi.fn().mockResolvedValue({ capacity: 4, days: [] }),
}));

vi.mock('../../../lib/api/profile', () => ({
  fetchMyInbody: vi.fn().mockResolvedValue([]),
}));

afterEach(() => { vi.clearAllMocks(); });

const user = {
  id: 'Nguyen Van A',
  phone_number: '0900000000',
  goal: '',
  health_note: '',
  address: '',
  height: '',
  weight: '',
  avatar: '',
  age: 25,
};

describe('OverviewScreen', () => {
  it('greets the user by their last name', async () => {
    render(<OverviewScreen user={user} onNavigateTab={vi.fn()} />);
    expect(screen.getByText(/Xin chào, A/)).toBeInTheDocument();
  });

  it('shows the AI Coach contextual entry after loading', async () => {
    render(<OverviewScreen user={user} onNavigateTab={vi.fn()} />);
    await waitFor(() => expect(screen.getByText(/Hỏi AI Coach/)).toBeInTheDocument());
  });

  it('shows the booking CTA when no upcoming session', async () => {
    render(<OverviewScreen user={user} onNavigateTab={vi.fn()} />);
    await waitFor(() => expect(screen.getByText('Đặt lịch tập')).toBeInTheDocument());
  });
});
