import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import * as useProfileModule from '../../shared/hooks/useProfile';
import * as authLib from '../../../lib/auth';
import { MobileShell } from './MobileShell';

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

vi.mock('../../../lib/api/notifications', () => ({
  fetchNotifications: vi.fn().mockResolvedValue([]),
  fetchUnreadCount: vi.fn().mockResolvedValue(0),
  markNotificationRead: vi.fn(),
  markAllNotificationsRead: vi.fn(),
  parseNotificationTarget: () => null,
}));
vi.mock('../../../lib/api/bookings', () => ({
  fetchAvailability: vi.fn().mockResolvedValue({ capacity: 4, days: [] }),
  createBooking: vi.fn(),
  cancelBooking: vi.fn(),
}));
vi.mock('../../../lib/api/chat', () => ({
  sendChatMessage: vi.fn(),
}));

// clearAllMocks (not restoreAllMocks) — restoring would wipe out the
// vi.mock() factories' mockResolvedValue implementations above, since
// those modules are mocked at the top level, not per-test with vi.spyOn.
afterEach(() => vi.clearAllMocks());

function renderShell(url = '/dashboard') {
  return render(
    <MemoryRouter initialEntries={[url]}>
      <MobileShell />
    </MemoryRouter>,
  );
}

describe('MobileShell', () => {
  it('renders the Overview screen by default', () => {
    vi.spyOn(useProfileModule, 'useProfile').mockReturnValue({ user, update: vi.fn() });
    vi.spyOn(authLib, 'consumeNewAccountFlag').mockReturnValue(false);
    renderShell();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Tổng quan');
    expect(screen.getByTestId('mobile-tab-overview')).toBeInTheDocument();
  });

  it('switches to the Booking screen when its tab is tapped', () => {
    vi.spyOn(useProfileModule, 'useProfile').mockReturnValue({ user, update: vi.fn() });
    vi.spyOn(authLib, 'consumeNewAccountFlag').mockReturnValue(false);
    renderShell();
    fireEvent.click(screen.getByTestId('mobile-tab-booking'));
    expect(screen.getByText('Đặt lịch tập')).toBeInTheDocument();
  });

  it('switches to the Profile tab root when its tab is tapped', () => {
    vi.spyOn(useProfileModule, 'useProfile').mockReturnValue({ user, update: vi.fn() });
    vi.spyOn(authLib, 'consumeNewAccountFlag').mockReturnValue(false);
    renderShell();
    fireEvent.click(screen.getByTestId('mobile-tab-profile'));
    expect(screen.getByText('Hồ sơ cá nhân')).toBeInTheDocument();
    expect(screen.getByText('Chỉ số InBody')).toBeInTheDocument();
  });

  it('pushes the profile stack and shows a back button when an entry is opened', () => {
    vi.spyOn(useProfileModule, 'useProfile').mockReturnValue({ user, update: vi.fn() });
    vi.spyOn(authLib, 'consumeNewAccountFlag').mockReturnValue(false);
    renderShell();
    fireEvent.click(screen.getByTestId('mobile-tab-profile'));
    fireEvent.click(screen.getByTestId('profile-tab-root-profile-entry'));
    expect(screen.getByTestId('mobile-profile-form')).toBeInTheDocument();
    expect(screen.getByTestId('stack-header-back')).toBeInTheDocument();
  });

  it('resets the profile stack when switching away from the Profile tab', () => {
    vi.spyOn(useProfileModule, 'useProfile').mockReturnValue({ user, update: vi.fn() });
    vi.spyOn(authLib, 'consumeNewAccountFlag').mockReturnValue(false);
    renderShell();
    fireEvent.click(screen.getByTestId('mobile-tab-profile'));
    fireEvent.click(screen.getByTestId('profile-tab-root-profile-entry'));
    fireEvent.click(screen.getByTestId('mobile-tab-overview'));
    fireEvent.click(screen.getByTestId('mobile-tab-profile'));
    // Should show the root again, not the previously-pushed profile form.
    expect(screen.getByText('Hồ sơ cá nhân')).toBeInTheDocument();
    expect(screen.queryByTestId('mobile-profile-form')).toBeNull();
  });
});

describe('MobileShell — restores the open screen after a refresh', () => {
  it('opens the tab named in ?tab=', () => {
    vi.spyOn(useProfileModule, 'useProfile').mockReturnValue({ user, update: vi.fn() });
    vi.spyOn(authLib, 'consumeNewAccountFlag').mockReturnValue(false);
    renderShell('/dashboard?tab=booking');
    expect(screen.getByText('Đặt lịch tập')).toBeInTheDocument();
    expect(screen.getByTestId('mobile-tab-booking')).toHaveAttribute('aria-current', 'page');
  });

  it('reopens a Profile sub-screen from ?screen=', () => {
    vi.spyOn(useProfileModule, 'useProfile').mockReturnValue({ user, update: vi.fn() });
    vi.spyOn(authLib, 'consumeNewAccountFlag').mockReturnValue(false);
    renderShell('/dashboard?tab=profile&screen=profile');
    expect(screen.getByTestId('mobile-profile-form')).toBeInTheDocument();
    expect(screen.getByTestId('stack-header-back')).toBeInTheDocument();
  });

  it("accepts the desktop tree's tab names", () => {
    vi.spyOn(useProfileModule, 'useProfile').mockReturnValue({ user, update: vi.fn() });
    vi.spyOn(authLib, 'consumeNewAccountFlag').mockReturnValue(false);
    renderShell('/dashboard?tab=bookings');
    expect(screen.getByTestId('mobile-tab-booking')).toHaveAttribute('aria-current', 'page');
  });
});
