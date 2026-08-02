import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { OverviewScreen } from './OverviewScreen';

vi.mock('../../../lib/api/notifications', () => ({
  fetchNotifications: vi.fn().mockResolvedValue([]),
  fetchUnreadCount: vi.fn().mockResolvedValue(0),
  markNotificationRead: vi.fn(),
  markAllNotificationsRead: vi.fn(),
  parseNotificationTarget: () => null,
}));

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
  it('greets the user by their last name', () => {
    render(<OverviewScreen user={user} onNavigateTab={vi.fn()} />);
    expect(screen.getByText(/Xin chào, A/)).toBeInTheDocument();
  });

  it('navigates to the coach tab when the AI Coach card is tapped', () => {
    const onNavigateTab = vi.fn();
    render(<OverviewScreen user={user} onNavigateTab={onNavigateTab} />);
    fireEvent.click(screen.getByText('Trò chuyện với AI Coach'));
    expect(onNavigateTab).toHaveBeenCalledWith('coach');
  });

  it('navigates to the booking tab when the booking card is tapped', () => {
    const onNavigateTab = vi.fn();
    render(<OverviewScreen user={user} onNavigateTab={onNavigateTab} />);
    fireEvent.click(screen.getByText('Đặt lịch tập'));
    expect(onNavigateTab).toHaveBeenCalledWith('booking');
  });

  it('navigates to the profile tab when the profile card is tapped', () => {
    const onNavigateTab = vi.fn();
    render(<OverviewScreen user={user} onNavigateTab={onNavigateTab} />);
    fireEvent.click(screen.getByText('Hồ sơ & InBody'));
    expect(onNavigateTab).toHaveBeenCalledWith('profile');
  });
});
