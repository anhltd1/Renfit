import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TrainerNotes } from './TrainerNotes';
import * as adminApi from '../../lib/api/admin';

vi.mock('../../lib/api/admin', async () => {
  const actual = await vi.importActual<typeof adminApi>('../../lib/api/admin');
  return { ...actual, fetchNotes: vi.fn(), addNote: vi.fn(), deleteNote: vi.fn() };
});

afterEach(() => {
  vi.clearAllMocks();
});

const note = {
  id: 'n1',
  customer_id: 'A',
  content: 'Gối trái hơi đau',
  created_at: '2026-01-02T10:00:00',
} as adminApi.TrainerNote;

describe('TrainerNotes', () => {
  it('deletes a note with an undo toast; undo re-creates it with the same text', async () => {
    vi.mocked(adminApi.fetchNotes).mockResolvedValue([note]);
    vi.mocked(adminApi.deleteNote).mockResolvedValue(undefined as never);
    vi.mocked(adminApi.addNote).mockResolvedValue({ ...note, id: 'n2' });
    render(<TrainerNotes customerId="A" />);

    fireEvent.click(await screen.findByRole('button', { name: 'Xóa ghi chú' }));
    await waitFor(() => expect(adminApi.deleteNote).toHaveBeenCalledWith('A', 'n1'));
    expect(await screen.findByText('Đã xoá ghi chú.')).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByText('Gối trái hơi đau')).toBeNull());

    fireEvent.click(screen.getByTestId('toast-action'));
    await waitFor(() => expect(adminApi.addNote).toHaveBeenCalledWith('A', 'Gối trái hơi đau'));
    expect(await screen.findByText('Gối trái hơi đau')).toBeInTheDocument();
    expect(await screen.findByText('Đã khôi phục ghi chú.')).toBeInTheDocument();
  });

  it('keeps the note and shows an error toast when delete fails', async () => {
    vi.mocked(adminApi.fetchNotes).mockResolvedValue([note]);
    vi.mocked(adminApi.deleteNote).mockRejectedValue(new Error('Không thể xoá.'));
    render(<TrainerNotes customerId="A" />);

    fireEvent.click(await screen.findByRole('button', { name: 'Xóa ghi chú' }));
    expect(await screen.findByTestId('toast-err')).toHaveTextContent('Không thể xoá.');
    expect(screen.getByText('Gối trái hơi đau')).toBeInTheDocument();
  });
});
