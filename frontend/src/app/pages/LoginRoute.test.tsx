import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { DeviceProvider } from '../device/DeviceProvider';
import { LoginRoute } from './LoginRoute';

vi.mock('../../lib/auth', () => ({
  getAuthUser: () => null,
  setAuthUser: vi.fn(),
  clearAuthUser: vi.fn(),
  consumeNewAccountFlag: () => false,
  markNewAccount: vi.fn(),
}));

function renderWithDevice(device: 'desktop' | 'mobile') {
  return render(
    <MemoryRouter>
      <DeviceProvider forceDevice={device}>
        <LoginRoute />
      </DeviceProvider>
    </MemoryRouter>,
  );
}

describe('LoginRoute', () => {
  it('renders the login form on desktop', () => {
    renderWithDevice('desktop');
    expect(screen.getByTestId('login-form')).toBeInTheDocument();
  });

  it('renders the login form on mobile', () => {
    renderWithDevice('mobile');
    expect(screen.getByRole('heading', { name: 'Đăng nhập' })).toBeInTheDocument();
  });
});
