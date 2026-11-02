import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AdminBookings } from './AdminBookings';
import * as adminApi from '../../lib/api/admin';

vi.mock('./CalendarKiosk', () => ({ CalendarKiosk: () => null }));
vi.mock('./BlockOffManager', () => ({ BlockOffManager: () => null }));
vi.mock('./BatchBookingMode', () => ({
  BatchBookingMode: ({ member }: { member: { id: string } | null }) => (
    <div data-testid="batch-mode">{member ? member.id : 'none'}</div>
  ),
}));

vi.mock('../../lib/api/admin', async () => {
  const actual = await vi.importActual<typeof adminApi>('../../lib/api/admin');
  return {
    ...actual,
    fetchBookings: vi.fn(async () => ({
      capacity: 4,
      days: [
        {
          date: '2099-01-05',
          slots: [
            { hour: 8, time: '2099-01-05T08:00', bookings: [] },
            { hour: 9, time: '2099-01-05T09:00', bookings: [] },
          ],
        },
      ],
    })),
    fetchCustomers: vi.fn(async () => [{ id: 'Lan', phone_number: '0900', goal: '', health_note: '', address: '', height: '', weight: '', avatar: '', age: null }]),
    assignBooking: vi.fn(async () => undefined),
  };
});

describe('AdminBookings (U23)', () => {
  it('renders headerActions and a persistent + in empty cells', async () => {
    render(<AdminBookings headerActions={<button type="button">Việc thêm</button>} />);
    expect(await screen.findByText('Việc thêm')).toBeInTheDocument();
    expect((await screen.findAllByTestId('cell-free-plus')).length).toBe(2);
  });

  it('after assigning, the toast offers "Đặt thêm buổi" which starts batch mode with that member', async () => {
    render(<AdminBookings />);
    fireEvent.click(await screen.findByRole('button', { name: /Đặt lịch tập lúc 08:00/ }));
    fireEvent.click(await screen.findByRole('button', { name: 'Lan' }));
    fireEvent.click(screen.getByRole('button', { name: 'Đặt lịch tập' }));
    const action = await screen.findByTestId('toast-action');
    expect(action).toHaveTextContent('Đặt thêm buổi');
    fireEvent.click(action);
    await waitFor(() => expect(screen.getByTestId('batch-mode')).toHaveTextContent('Lan'));
  });
});
