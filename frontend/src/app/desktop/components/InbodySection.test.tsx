import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { InbodySection } from './InbodySection';
import * as adminApi from '../../../lib/api/admin';

vi.mock('../../../lib/api/admin', async () => {
  const actual = await vi.importActual<typeof adminApi>('../../../lib/api/admin');
  return {
    ...actual,
    fetchInbody: vi.fn(),
    addInbody: vi.fn(),
  };
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('InbodySection', () => {
  it('loads and shows the record count', async () => {
    vi.mocked(adminApi.fetchInbody).mockResolvedValue([
      { id: '1', customer_id: 'A', height: 170, weight: 65, SMM: 30, BFM: 15, date_recorded: '2024-01-01' },
    ]);
    render(<InbodySection customerId="A" />);
    await waitFor(() => expect(screen.getByText(/1 lần đo/)).toBeInTheDocument());
  });

  it('renders the lazy-loaded chart without crashing (regression: fmtDate ReferenceError)', async () => {
    vi.mocked(adminApi.fetchInbody).mockResolvedValue([
      { id: '1', customer_id: 'A', height: 170, weight: 65, SMM: 30, BFM: 15, date_recorded: '2024-01-01' },
    ]);
    render(<InbodySection customerId="A" />);
    // Waiting for the metric label proves StackedInbodyChart itself finished
    // rendering past its Suspense fallback — not just the section header,
    // which stayed correct even while the chart's internal fmtDate() call
    // threw a ReferenceError after U7's lazy-load refactor.
    await waitFor(() => expect(screen.getByText('Chiều cao')).toBeInTheDocument(), { timeout: 10000 });
  });

  it('opens the AddInbodyModal when "Thêm kết quả" is clicked', async () => {
    vi.mocked(adminApi.fetchInbody).mockResolvedValue([]);
    render(<InbodySection customerId="A" />);
    await waitFor(() => expect(screen.getByText(/0 lần đo/)).toBeInTheDocument());
    fireEvent.click(screen.getByText('Thêm kết quả'));
    expect(screen.getByTestId('modal-overlay')).toBeInTheDocument();
  });
});
