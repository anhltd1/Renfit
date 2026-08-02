import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { InbodySectionMobile } from './InbodySectionMobile';
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

describe('InbodySectionMobile', () => {
  it('loads and shows the record count', async () => {
    vi.mocked(adminApi.fetchInbody).mockResolvedValue([
      { id: '1', customer_id: 'A', height: 170, weight: 65, SMM: 30, BFM: 15, date_recorded: '2024-01-01' },
    ]);
    render(<InbodySectionMobile customerId="A" />);
    await waitFor(() => expect(screen.getByText(/1 lần đo/)).toBeInTheDocument());
  });

  it('renders the lazy-loaded chart without crashing (regression: fmtDate ReferenceError)', async () => {
    vi.mocked(adminApi.fetchInbody).mockResolvedValue([
      { id: '1', customer_id: 'A', height: 170, weight: 65, SMM: 30, BFM: 15, date_recorded: '2024-01-01' },
    ]);
    render(<InbodySectionMobile customerId="A" />);
    // Waiting for a metric label proves StackedInbodyChart itself rendered
    // past its Suspense fallback, not just this section's own header text.
    await waitFor(() => expect(screen.getByText('Chiều cao')).toBeInTheDocument(), { timeout: 10000 });
  });

  it('opens the AddInbodySheet when "Thêm" is clicked', async () => {
    vi.mocked(adminApi.fetchInbody).mockResolvedValue([]);
    render(<InbodySectionMobile customerId="A" />);
    await waitFor(() => expect(screen.getByText(/0 lần đo/)).toBeInTheDocument());
    fireEvent.click(screen.getByText('Thêm'));
    expect(screen.getByTestId('sheet-overlay')).toBeInTheDocument();
  });
});
