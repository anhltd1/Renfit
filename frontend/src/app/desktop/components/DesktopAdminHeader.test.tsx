import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DesktopAdminHeader } from './DesktopAdminHeader';
import * as adminApi from '../../../lib/api/admin';

vi.mock('../../../lib/api/admin', async () => {
  const actual = await vi.importActual<typeof adminApi>('../../../lib/api/admin');
  return {
    ...actual,
    fetchTrainerNotifications: vi.fn().mockResolvedValue([]),
  };
});

afterEach(() => {
  vi.clearAllMocks();
});

function renderHeader(overrides: Partial<Parameters<typeof DesktopAdminHeader>[0]> = {}) {
  const onViewChange = vi.fn();
  const onRefresh = vi.fn();
  const onLogout = vi.fn();
  render(
    <DesktopAdminHeader
      view="clients"
      onViewChange={onViewChange}
      customerCount={5}
      onRefresh={onRefresh}
      refreshing={false}
      onLogout={onLogout}
      {...overrides}
    />,
  );
  return { onViewChange, onRefresh, onLogout };
}

describe('DesktopAdminHeader', () => {
  it('renders the customer count pill on the clients view', () => {
    renderHeader();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('hội viên')).toBeInTheDocument();
  });

  it('switches views when a tab is clicked', () => {
    const { onViewChange } = renderHeader();
    fireEvent.click(screen.getByTestId('tab-bookings'));
    expect(onViewChange).toHaveBeenCalledWith('bookings');
  });

  it('calls onRefresh when the refresh button is clicked', () => {
    const { onRefresh } = renderHeader();
    fireEvent.click(screen.getByTestId('button-refresh'));
    expect(onRefresh).toHaveBeenCalledOnce();
  });

  it('calls onLogout when the logout button is clicked', () => {
    const { onLogout } = renderHeader();
    fireEvent.click(screen.getByTestId('button-logout'));
    expect(onLogout).toHaveBeenCalledOnce();
  });

  it('hides the refresh button and count pill on the bookings view', () => {
    renderHeader({ view: 'bookings' });
    expect(screen.queryByTestId('button-refresh')).toBeNull();
  });
});
