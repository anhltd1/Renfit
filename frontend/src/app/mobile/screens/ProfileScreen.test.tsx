import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import * as useProfileModule from '../../shared/hooks/useProfile';
import { ProfileScreen } from './ProfileScreen';

const user = {
  id: 'Nguyen Van A',
  phone_number: '0900000000',
  goal: 'Giảm cân',
  health_note: '',
  address: '',
  height: '170',
  weight: '65',
  avatar: '',
  age: 25,
};

afterEach(() => vi.restoreAllMocks());

describe('ProfileScreen', () => {
  it('renders the profile form and calls onBack from the header', () => {
    vi.spyOn(useProfileModule, 'useProfile').mockReturnValue({ user, update: vi.fn() });
    const onBack = vi.fn();
    render(<ProfileScreen onBack={onBack} />);
    expect(screen.getByTestId('mobile-profile-form')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('stack-header-back'));
    expect(onBack).toHaveBeenCalledOnce();
  });

  it('calls update() on submit', async () => {
    const update = vi.fn().mockResolvedValue(user);
    vi.spyOn(useProfileModule, 'useProfile').mockReturnValue({ user, update });
    render(<ProfileScreen onBack={vi.fn()} />);
    fireEvent.submit(screen.getByTestId('mobile-profile-form'));
    await waitFor(() => expect(update).toHaveBeenCalledOnce());
    expect(screen.getByTestId('mobile-profile-success')).toBeInTheDocument();
  });

  it('shows an error message when update() rejects', async () => {
    vi.spyOn(useProfileModule, 'useProfile').mockReturnValue({
      user,
      update: vi.fn().mockRejectedValue(new Error('Cập nhật thất bại.')),
    });
    render(<ProfileScreen onBack={vi.fn()} />);
    fireEvent.submit(screen.getByTestId('mobile-profile-form'));
    await waitFor(() => expect(screen.getByTestId('mobile-profile-error')).toHaveTextContent('Cập nhật thất bại.'));
  });
});
