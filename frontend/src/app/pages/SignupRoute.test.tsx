import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { DeviceProvider } from '../device/DeviceProvider';
import { SignupRoute } from './SignupRoute';

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
        <SignupRoute />
      </DeviceProvider>
    </MemoryRouter>,
  );
}

describe('SignupRoute', () => {
  it('renders the signup form on desktop', () => {
    renderWithDevice('desktop');
    expect(screen.getByTestId('signup-form')).toBeInTheDocument();
  });

  it('renders the signup form on mobile', () => {
    renderWithDevice('mobile');
    expect(screen.getByRole('heading', { name: 'Tạo tài khoản' })).toBeInTheDocument();
  });
});
