import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DesktopHeader } from './DesktopHeader';

vi.mock('../../../lib/api/notifications', () => ({
  fetchNotifications: vi.fn().mockResolvedValue([]),
  fetchUnreadCount: vi.fn().mockResolvedValue(0),
  markNotificationRead: vi.fn(),
  markAllNotificationsRead: vi.fn(),
  parseNotificationTarget: () => null,
}));

describe('DesktopHeader', () => {
  it('shows the overview title on the overview tab', () => {
    render(<DesktopHeader tab="overview" customerId="cust-1" onNavigateFromNotification={() => {}} />);
    expect(screen.getByText('Hồ sơ & Thể trạng')).toBeInTheDocument();
  });

  it('shows the AI Coach title + badge on the chat tab', () => {
    render(<DesktopHeader tab="chat" customerId="cust-1" onNavigateFromNotification={() => {}} />);
    expect(screen.getByText('Renfit AI Coach')).toBeInTheDocument();
    expect(screen.getByText('AI-Powered')).toBeInTheDocument();
  });

  it('shows the booking title on the bookings tab', () => {
    render(<DesktopHeader tab="bookings" customerId="cust-1" onNavigateFromNotification={() => {}} />);
    expect(screen.getByText('Đặt Lịch Tập')).toBeInTheDocument();
  });
});
