import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { AdminLoginPage } from './AdminLoginPage';
import * as useAdminAuthModule from '../../shared/hooks/useAdminAuth';

vi.mock('../../shared/hooks/useAdminAuth');

const mockNavigate = vi.fn();
vi.mock('react-router', async () => {
  const actual = await vi.importActual<typeof import('react-router')>('react-router');
  return { ...actual, useNavigate: () => mockNavigate };
});

afterEach(() => {
  vi.clearAllMocks();
});

function mockUseAdminAuth(login: ReturnType<typeof vi.fn>) {
  vi.mocked(useAdminAuthModule.useAdminAuth).mockReturnValue({
    token: null,
    login,
    logout: vi.fn(),
  });
}

describe('AdminLoginPage (mobile)', () => {
  it('shows a validation error when fields are empty', () => {
    mockUseAdminAuth(vi.fn());
    render(<MemoryRouter><AdminLoginPage /></MemoryRouter>);
    fireEvent.click(screen.getByTestId('admin-login-submit-button'));
    expect(screen.getByTestId('admin-login-error')).toHaveTextContent('Vui lòng nhập đầy đủ thông tin.');
  });

  it('calls useAdminAuth().login and navigates on success', async () => {
    const login = vi.fn().mockResolvedValue('token-123');
    mockUseAdminAuth(login);
    render(<MemoryRouter><AdminLoginPage /></MemoryRouter>);

    fireEvent.change(screen.getByTestId('input-username'), { target: { value: 'admin' } });
    fireEvent.change(screen.getByTestId('input-password'), { target: { value: 'secret' } });
    fireEvent.click(screen.getByTestId('admin-login-submit-button'));

    await waitFor(() => expect(login).toHaveBeenCalledWith('admin', 'secret'));
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/admin/dashboard'));
  });

  it('shows an error message when login fails', async () => {
    const login = vi.fn().mockRejectedValue(new Error('Sai tài khoản hoặc mật khẩu.'));
    mockUseAdminAuth(login);
    render(<MemoryRouter><AdminLoginPage /></MemoryRouter>);

    fireEvent.change(screen.getByTestId('input-username'), { target: { value: 'admin' } });
    fireEvent.change(screen.getByTestId('input-password'), { target: { value: 'wrong' } });
    fireEvent.click(screen.getByTestId('admin-login-submit-button'));

    await waitFor(() =>
      expect(screen.getByTestId('admin-login-error')).toHaveTextContent('Sai tài khoản hoặc mật khẩu.'),
    );
  });
});
