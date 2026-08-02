import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import * as useAuthModule from '../../shared/hooks/useAuth';
import { LoginPage } from './LoginPage';

afterEach(() => vi.restoreAllMocks());

function renderPage() {
  return render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>,
  );
}

describe('Mobile LoginPage', () => {
  it('shows a validation error when fields are empty', () => {
    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({ user: null, login: vi.fn(), signup: vi.fn(), logout: vi.fn() });
    renderPage();
    fireEvent.submit(screen.getByTestId('login-form'));
    expect(screen.getByTestId('login-error')).toHaveTextContent('Vui lòng nhập đầy đủ thông tin.');
  });

  it('calls useAuth().login with the entered credentials', async () => {
    const login = vi.fn().mockResolvedValue({});
    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({ user: null, login, signup: vi.fn(), logout: vi.fn() });
    renderPage();

    fireEvent.change(screen.getByTestId('input-phone'), { target: { value: '0901234567' } });
    fireEvent.change(screen.getByTestId('input-password'), { target: { value: 'secret1' } });
    fireEvent.submit(screen.getByTestId('login-form'));

    await waitFor(() => expect(login).toHaveBeenCalledWith({ phone_number: '0901234567', password: 'secret1' }));
  });
});
