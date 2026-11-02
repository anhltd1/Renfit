import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DesktopAdminHeader } from './DesktopAdminHeader';
import { DeviceContext } from '../../device/DeviceContext';
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

describe('DesktopAdminHeader — U25', () => {
  it('marks only the active tab with aria-current inside a labelled nav', () => {
    renderHeader({ view: 'bookings' });
    expect(screen.getByRole('navigation', { name: 'Điều hướng quản trị' })).toBeInTheDocument();
    expect(screen.getByTestId('tab-bookings')).toHaveAttribute('aria-current', 'page');
    expect(screen.getByTestId('tab-clients')).not.toHaveAttribute('aria-current');
  });

  function renderWithDevice(override: 'mobile' | 'desktop' | null = null) {
    const setOverride = vi.fn();
    render(
      <DeviceContext.Provider value={{ device: 'desktop', isMobile: false, isDesktop: true, override, setOverride }}>
        <DesktopAdminHeader view="today" onViewChange={vi.fn()} customerCount={0} onRefresh={vi.fn()} refreshing={false} onLogout={vi.fn()} />
      </DeviceContext.Provider>,
    );
    return setOverride;
  }

  it('has no interface menu without a DeviceProvider', () => {
    renderHeader();
    expect(screen.queryByTestId('admin-header-menu')).toBeNull();
  });

  it('opens the menu, marks the current choice and switches to phone mode', () => {
    const setOverride = renderWithDevice(null);
    const btn = screen.getByRole('button', { name: 'Thêm' });
    expect(btn).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(btn);
    expect(btn).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByTestId('admin-menu-auto')).toHaveAttribute('aria-checked', 'true');
    fireEvent.click(screen.getByTestId('admin-menu-phone'));
    expect(setOverride).toHaveBeenCalledWith('mobile');
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('"Tự động" clears the override', () => {
    const setOverride = renderWithDevice('mobile');
    fireEvent.click(screen.getByRole('button', { name: 'Thêm' }));
    expect(screen.getByTestId('admin-menu-phone')).toHaveAttribute('aria-checked', 'true');
    fireEvent.click(screen.getByTestId('admin-menu-auto'));
    expect(setOverride).toHaveBeenCalledWith(null);
  });

  it('closes on Esc and on outside click', () => {
    renderWithDevice();
    fireEvent.click(screen.getByRole('button', { name: 'Thêm' }));
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByRole('menu')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Thêm' }));
    fireEvent.mouseDown(document.body);
    expect(screen.queryByRole('menu')).toBeNull();
  });
});
