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
  it.each([
    ['home', 'Tổng quan'],
    ['overview', 'Hồ sơ & InBody'],
    ['chat', 'AI Coach'],
    ['bookings', 'Đặt lịch tập'],
  ] as const)('shows a noun title as the h1 on the %s tab', (tab, title) => {
    render(<DesktopHeader tab={tab} customerId="cust-1" onNavigateFromNotification={() => {}} />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(title);
  });

  it('carries no marketing badge on the chat tab', () => {
    render(<DesktopHeader tab="chat" customerId="cust-1" onNavigateFromNotification={() => {}} />);
    expect(screen.queryByText('AI-Powered')).not.toBeInTheDocument();
  });
});
