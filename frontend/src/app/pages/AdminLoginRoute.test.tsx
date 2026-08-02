import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { DeviceProvider } from '../device/DeviceProvider';
import { AdminLoginRoute } from './AdminLoginRoute';

vi.mock('../desktop/pages/AdminLoginPage', () => ({
  AdminLoginPage: () => <div data-testid="desktop-admin-login-stub" />,
}));
vi.mock('../mobile/pages/AdminLoginPage', () => ({
  AdminLoginPage: () => <div data-testid="mobile-admin-login-stub" />,
}));

function renderWithDevice(device: 'desktop' | 'mobile') {
  return render(
    <MemoryRouter>
      <DeviceProvider forceDevice={device}>
        <AdminLoginRoute />
      </DeviceProvider>
    </MemoryRouter>,
  );
}

describe('AdminLoginRoute', () => {
  it('renders the desktop admin login on desktop', () => {
    renderWithDevice('desktop');
    expect(screen.getByTestId('desktop-admin-login-stub')).toBeInTheDocument();
    expect(screen.queryByTestId('mobile-admin-login-stub')).toBeNull();
  });

  it('renders the mobile admin login on mobile', () => {
    renderWithDevice('mobile');
    expect(screen.getByTestId('mobile-admin-login-stub')).toBeInTheDocument();
    expect(screen.queryByTestId('desktop-admin-login-stub')).toBeNull();
  });
});
