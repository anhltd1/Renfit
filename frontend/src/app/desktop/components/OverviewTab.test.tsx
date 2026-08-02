import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import * as useProfileModule from '../../shared/hooks/useProfile';
import * as useInbodyModule from '../../shared/hooks/useInbody';
import { OverviewTab } from './OverviewTab';

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

function mockHooks(update = vi.fn().mockResolvedValue(user)) {
  vi.spyOn(useProfileModule, 'useProfile').mockReturnValue({ user, update });
  vi.spyOn(useInbodyModule, 'useInbodyHistory').mockReturnValue({
    data: [],
    loading: false,
    error: null,
    refetch: vi.fn(),
  });
  return { update };
}

describe('OverviewTab', () => {
  it('renders the profile form pre-filled with the current user', () => {
    mockHooks();
    render(<OverviewTab />);
    expect(screen.getByText('Nguyen Van A')).toBeInTheDocument();
    expect(screen.getByTestId('overview-profile-form')).toBeInTheDocument();
  });

  it('shows the InBody empty state when there are no records', () => {
    mockHooks();
    render(<OverviewTab />);
    expect(screen.getByText(/Chưa có dữ liệu InBody/)).toBeInTheDocument();
  });

  it('calls update() with the current form values on submit', async () => {
    const { update } = mockHooks();
    render(<OverviewTab />);
    fireEvent.submit(screen.getByTestId('overview-profile-form'));
    await waitFor(() => expect(update).toHaveBeenCalledOnce());
    expect(update).toHaveBeenCalledWith(expect.objectContaining({ customer_id: user.id, goal: user.goal }));
  });

  it('shows a success message after a successful update', async () => {
    mockHooks();
    render(<OverviewTab />);
    fireEvent.submit(screen.getByTestId('overview-profile-form'));
    await waitFor(() => expect(screen.getByTestId('overview-success')).toBeInTheDocument());
  });

  it('shows an error message when update() rejects', async () => {
    mockHooks(vi.fn().mockRejectedValue(new Error('Cập nhật thất bại.')));
    render(<OverviewTab />);
    fireEvent.submit(screen.getByTestId('overview-profile-form'));
    await waitFor(() => expect(screen.getByTestId('overview-error')).toHaveTextContent('Cập nhật thất bại.'));
  });
});
