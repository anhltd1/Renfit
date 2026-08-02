import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import * as useAuthModule from '../../shared/hooks/useAuth';
import * as authLib from '../../../lib/auth';
import { SignupPage } from './SignupPage';

afterEach(() => vi.restoreAllMocks());

function renderPage() {
  return render(
    <MemoryRouter>
      <SignupPage />
    </MemoryRouter>,
  );
}

function fillRequiredFields() {
  fireEvent.change(screen.getByTestId('input-name'), { target: { value: 'Nguyen Van A' } });
  fireEvent.change(screen.getByTestId('input-phone'), { target: { value: '0901234567' } });
  fireEvent.change(screen.getByTestId('input-password'), { target: { value: 'secret1' } });
  fireEvent.change(screen.getByTestId('input-confirm-password'), { target: { value: 'secret1' } });
}

describe('Desktop SignupPage', () => {
  it('shows a validation error when the name is missing', () => {
    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({ user: null, login: vi.fn(), signup: vi.fn(), logout: vi.fn() });
    renderPage();
    fireEvent.submit(screen.getByTestId('signup-form'));
    expect(screen.getByTestId('signup-error')).toHaveTextContent('Vui lòng nhập họ và tên.');
  });

  it('calls useAuth().signup and markNewAccount on valid submit', async () => {
    const signup = vi.fn().mockResolvedValue({});
    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({ user: null, login: vi.fn(), signup, logout: vi.fn() });
    const markSpy = vi.spyOn(authLib, 'markNewAccount').mockImplementation(() => {});
    renderPage();

    fillRequiredFields();
    fireEvent.submit(screen.getByTestId('signup-form'));

    await waitFor(() => expect(signup).toHaveBeenCalledOnce());
    expect(markSpy).toHaveBeenCalledOnce();
  });

  it('shows the API error message when signup rejects', async () => {
    const signup = vi.fn().mockRejectedValue(new Error('Đăng ký thất bại. Vui lòng thử lại.'));
    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({ user: null, login: vi.fn(), signup, logout: vi.fn() });
    renderPage();

    fillRequiredFields();
    fireEvent.submit(screen.getByTestId('signup-form'));

    await waitFor(() => expect(screen.getByTestId('signup-error')).toHaveTextContent('Đăng ký thất bại.'));
  });
});
