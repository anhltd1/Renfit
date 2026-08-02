import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { CustomerDetail } from './CustomerDetail';
import * as adminApi from '../../../lib/api/admin';
import type { CustomerSummary } from '../../../lib/api/admin';

const customer: CustomerSummary = {
  id: 'Nguyen Van A',
  phone_number: '0900000000',
  goal: 'Giảm mỡ',
  health_note: 'Không có',
  address: 'Q1, TP.HCM',
  height: '170',
  weight: '65',
  avatar: '',
  age: 25,
};

vi.mock('../../../lib/api/admin', async () => {
  const actual = await vi.importActual<typeof adminApi>('../../../lib/api/admin');
  return {
    ...actual,
    fetchInbody: vi.fn(),
  };
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('CustomerDetail', () => {
  it('renders hero info and detail fields', async () => {
    vi.mocked(adminApi.fetchInbody).mockResolvedValue([]);
    render(<CustomerDetail customer={customer} />);
    expect(screen.getByText('Nguyen Van A')).toBeInTheDocument();
    expect(screen.getByText('0900000000')).toBeInTheDocument();
    expect(screen.getByText('Giảm mỡ')).toBeInTheDocument();
    expect(screen.getByText('25 tuổi')).toBeInTheDocument();
    expect(screen.getByText('Q1, TP.HCM')).toBeInTheDocument();
    await waitFor(() => expect(adminApi.fetchInbody).toHaveBeenCalledWith(customer.id));
  });

  it('does not render an onBack button (desktop-only, no back navigation)', () => {
    vi.mocked(adminApi.fetchInbody).mockResolvedValue([]);
    render(<CustomerDetail customer={customer} />);
    expect(screen.queryByText('Danh sách hội viên')).toBeNull();
  });
});
