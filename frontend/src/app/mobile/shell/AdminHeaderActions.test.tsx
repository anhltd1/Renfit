import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AdminHeaderActions } from './AdminHeaderActions';
import { DeviceContext, type DeviceState } from '../../device/DeviceContext';
import * as adminApi from '../../../lib/api/admin';

vi.mock('../../../lib/api/admin', async () => {
  const actual = await vi.importActual<typeof adminApi>('../../../lib/api/admin');
  return {
    ...actual,
    fetchTrainerNotifications: vi.fn(async () => []),
    fetchTrainerUnreadCount: vi.fn(async () => 0),
  };
});

afterEach(() => vi.clearAllMocks());

function renderActions(override: DeviceState['override'] = null) {
  const setOverride = vi.fn();
  const onLogout = vi.fn();
  const onRefresh = vi.fn();
  const device: DeviceState = { device: 'mobile', isMobile: true, isDesktop: false, override, setOverride };
  render(
    <DeviceContext.Provider value={device}>
      <AdminHeaderActions onNavigate={vi.fn()} onLogout={onLogout} onRefresh={onRefresh} />
    </DeviceContext.Provider>,
  );
  return { setOverride, onLogout, onRefresh };
}

describe('AdminHeaderActions', () => {
  it('opens and closes the overflow menu (button, Esc, click outside)', () => {
    renderActions();
    const btn = screen.getByRole('button', { name: 'Thêm' });
    expect(btn).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(btn);
    expect(btn).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('menu')).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByRole('menu')).toBeNull();

    fireEvent.click(btn);
    expect(screen.getByRole('menu')).toBeInTheDocument();
    fireEvent.mouseDown(document.body);
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('tablet mode forces the desktop tree; Tự động clears the override', () => {
    const { setOverride } = renderActions();
    fireEvent.click(screen.getByRole('button', { name: 'Thêm' }));
    expect(screen.getByTestId('admin-menu-auto')).toHaveAttribute('aria-checked', 'true');
    fireEvent.click(screen.getByTestId('admin-menu-tablet'));
    expect(setOverride).toHaveBeenCalledWith('desktop');
    expect(screen.queryByRole('menu')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Thêm' }));
    fireEvent.click(screen.getByTestId('admin-menu-auto'));
    expect(setOverride).toHaveBeenLastCalledWith(null);
  });

  it('marks tablet mode as the current choice when overridden', () => {
    renderActions('desktop');
    fireEvent.click(screen.getByRole('button', { name: 'Thêm' }));
    expect(screen.getByTestId('admin-menu-tablet')).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByTestId('admin-menu-auto')).toHaveAttribute('aria-checked', 'false');
  });

  it('runs refresh and logout from the menu', () => {
    const { onRefresh, onLogout } = renderActions();
    fireEvent.click(screen.getByRole('button', { name: 'Thêm' }));
    fireEvent.click(screen.getByTestId('admin-menu-refresh'));
    expect(onRefresh).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole('button', { name: 'Thêm' }));
    fireEvent.click(screen.getByTestId('admin-mobile-logout'));
    expect(onLogout).toHaveBeenCalledOnce();
  });
});
