import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react';
import fc from 'fast-check';
import {
  BookingStatusActions,
  getStatusActions,
  hasSessionStarted,
  useBookingStatusChange,
} from './BookingStatusActions';
import type { BookingStatusKey } from './statusMeta';

// Plain delegating function (not a vi.fn) so a rejected promise from the
// implementation isn't re-wrapped by the spy into an unhandled rejection.
const api = vi.hoisted(() => ({
  calls: [] as Array<[string, string]>,
  impl: (async () => ({ message: 'ok' })) as (id: string, s: string) => Promise<{ message: string }>,
}));
vi.mock('../../../lib/api/admin', () => ({
  updateBookingStatus: (id: string, s: string) => {
    api.calls.push([id, s]);
    return api.impl(id, s);
  },
}));
const mockedUpdate = {
  mockReset: () => {
    api.calls = [];
    api.impl = async () => ({ message: 'ok' });
  },
  mockResolvedValue: (v: { message: string }) => {
    api.impl = async () => v;
  },
  mockImplementation: (f: typeof api.impl) => {
    api.impl = f;
  },
  get lastCall() {
    return api.calls[api.calls.length - 1];
  },
};

const pad = (n: number) => String(n).padStart(2, '0');

/** Domain generator: a wall-clock ICT slot string + its true UTC instant. */
const slotArb = fc
  .record({
    y: fc.integer({ min: 2024, max: 2030 }),
    mo: fc.integer({ min: 1, max: 12 }),
    d: fc.integer({ min: 1, max: 28 }),
    h: fc.integer({ min: 0, max: 23 }),
    mi: fc.integer({ min: 0, max: 59 }),
    seconds: fc.boolean(),
  })
  .map(({ y, mo, d, h, mi, seconds }) => ({
    time: `${y}-${pad(mo)}-${pad(d)}T${pad(h)}:${pad(mi)}${seconds ? ':00' : ''}`,
    utc: Date.UTC(y, mo - 1, d, h - 7, mi),
  }));

describe('hasSessionStarted (property-based, ICT wall clock)', () => {
  it('is true exactly when now >= slot start interpreted as UTC+7', () => {
    fc.assert(
      fc.property(slotArb, fc.integer({ min: -3 * 86_400_000, max: 3 * 86_400_000 }), (slot, delta) => {
        const now = new Date(slot.utc + delta);
        expect(hasSessionStarted(slot.time, now)).toBe(delta >= 0);
      }),
    );
  });
});

describe('hasSessionStarted (example-based)', () => {
  it('treats 07:00 ICT as 00:00 UTC regardless of browser timezone', () => {
    expect(hasSessionStarted('2026-10-29T07:00', new Date('2026-10-28T23:59:59Z'))).toBe(false);
    expect(hasSessionStarted('2026-10-29T07:00', new Date('2026-10-29T00:00:00Z'))).toBe(true);
  });

  it('returns false for unparseable input', () => {
    expect(hasSessionStarted('07:00', new Date())).toBe(false);
    expect(hasSessionStarted('', new Date())).toBe(false);
  });
});

describe('getStatusActions', () => {
  const nexts = (s: string, started: boolean) => getStatusActions(s, started).map((a) => a.next);

  it('follows the backend transition table', () => {
    expect(nexts('pending', false)).toEqual(['approved', 'rejected']);
    expect(nexts('approved', false)).toEqual(['rejected', 'pending']);
    expect(nexts('approved', true)).toEqual(['completed', 'no_show', 'rejected']);
    expect(nexts('completed', true)).toEqual(['no_show', 'approved']);
    expect(nexts('no_show', true)).toEqual(['completed', 'approved']);
    expect(nexts('rejected', false)).toEqual(['pending', 'approved']);
    expect(nexts('weird', true)).toEqual([]);
  });

  it('never offers the current status', () => {
    const all: BookingStatusKey[] = ['pending', 'approved', 'rejected', 'completed', 'no_show'];
    for (const s of all) for (const started of [true, false]) expect(nexts(s, started)).not.toContain(s);
  });
});

describe('BookingStatusActions', () => {
  const past = '2020-01-06T08:00';
  const future = '2099-01-05T08:00';

  it('renders attendance actions for a started approved session with member name in aria-label', () => {
    render(
      <BookingStatusActions
        booking={{ id: 'b1', customer_id: 'Lan', time: past, status: 'approved' }}
        onChange={vi.fn().mockResolvedValue(undefined)}
      />,
    );
    expect(screen.getByRole('button', { name: 'Đã tập: Lan' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Vắng: Lan' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Từ chối: Lan' })).toBeInTheDocument();
    expect(screen.queryByTestId('status-action-approved')).toBeNull();
  });

  it('hides attendance before the session starts', () => {
    render(
      <BookingStatusActions
        booking={{ id: 'b1', customer_id: 'Lan', time: future, status: 'approved' }}
        onChange={vi.fn().mockResolvedValue(undefined)}
      />,
    );
    expect(screen.queryByTestId('status-action-completed')).toBeNull();
    expect(screen.getByTestId('status-action-pending')).toHaveTextContent('Chờ duyệt');
  });

  it('calls onChange(next, prev) and disables buttons while working or busy', async () => {
    let resolve!: () => void;
    const onChange = vi.fn(() => new Promise<void>((r) => { resolve = r; }));
    const { rerender } = render(
      <BookingStatusActions booking={{ id: 'b1', customer_id: 'Lan', time: past, status: 'completed' }} onChange={onChange} />,
    );
    expect(screen.getByTestId('status-action-approved')).toHaveTextContent('Về Đã duyệt');
    fireEvent.click(screen.getByTestId('status-action-no_show'));
    expect(onChange).toHaveBeenCalledWith('no_show', 'completed');
    expect(screen.getByTestId('status-action-approved')).toBeDisabled();
    await act(async () => resolve());
    expect(screen.getByTestId('status-action-approved')).not.toBeDisabled();

    rerender(
      <BookingStatusActions booking={{ id: 'b1', customer_id: 'Lan', time: past, status: 'completed' }} onChange={onChange} busy />,
    );
    expect(screen.getByTestId('status-action-approved')).toBeDisabled();
  });
});

describe('useBookingStatusChange', () => {
  beforeEach(() => mockedUpdate.mockReset());

  it('marks attendance and offers undo back to prev', async () => {
    mockedUpdate.mockResolvedValue({ message: 'ok' });
    const show = vi.fn();
    const refresh = vi.fn();
    const { result } = renderHook(() => useBookingStatusChange({ show, refresh }));
    let ok = false;
    await act(async () => {
      ok = await result.current.change({ id: 'b1', customer_id: 'Lan' }, 'completed', 'approved');
    });
    expect(ok).toBe(true);
    expect(api.calls).toContainEqual(['b1', 'completed']);
    expect(refresh).toHaveBeenCalledTimes(1);
    const toast = show.mock.calls[0][0];
    expect(toast).toMatchObject({ kind: 'ok', text: 'Đã điểm danh Lan: Đã tập.' });
    expect(toast.action.label).toBe('Hoàn tác');

    act(() => toast.action.onClick());
    await waitFor(() => expect(mockedUpdate.lastCall).toEqual(['b1', 'approved']));
    await waitFor(() => expect(refresh).toHaveBeenCalledTimes(2));
  });

  it('uses the right texts and no undo for approve', async () => {
    mockedUpdate.mockResolvedValue({ message: 'ok' });
    const show = vi.fn();
    const { result } = renderHook(() => useBookingStatusChange({ show, refresh: vi.fn() }));
    await act(async () => { await result.current.change({ id: 'b1', customer_id: 'Lan' }, 'approved', 'pending'); });
    expect(show.mock.calls[0][0]).toMatchObject({ kind: 'ok', text: 'Đã duyệt lịch của Lan.', action: undefined });
    await act(async () => { await result.current.change({ id: 'b1', customer_id: 'Lan' }, 'no_show', 'approved'); });
    expect(show.mock.calls[1][0].text).toBe('Đã điểm danh Lan: Vắng.');
    await act(async () => { await result.current.change({ id: 'b1', customer_id: 'Lan' }, 'rejected', 'pending'); });
    expect(show.mock.calls[2][0].text).toBe('Đã từ chối lịch của Lan.');
  });

  it('surfaces the backend message on failure and does not refresh', async () => {
    mockedUpdate.mockImplementation(async () => {
      throw new Error('Buổi tập chưa bắt đầu.');
    });
    const show = vi.fn();
    const refresh = vi.fn();
    const { result } = renderHook(() => useBookingStatusChange({ show, refresh }));
    let ok = true;
    await act(async () => {
      ok = await result.current.change({ id: 'b1', customer_id: 'Lan' }, 'completed', 'approved');
    });
    expect(ok).toBe(false);
    expect(show).toHaveBeenCalledWith({ kind: 'err', text: 'Buổi tập chưa bắt đầu.' });
    expect(refresh).not.toHaveBeenCalled();
  });
});
