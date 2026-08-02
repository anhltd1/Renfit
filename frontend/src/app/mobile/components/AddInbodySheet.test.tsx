import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AddInbodySheet } from './AddInbodySheet';
import * as adminApi from '../../../lib/api/admin';

vi.mock('../../../lib/api/admin', async () => {
  const actual = await vi.importActual<typeof adminApi>('../../../lib/api/admin');
  return {
    ...actual,
    addInbody: vi.fn(),
  };
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('AddInbodySheet', () => {
  it('renders nothing when closed', () => {
    render(<AddInbodySheet open={false} customerId="A" lastRecord={null} onClose={vi.fn()} onAdded={vi.fn()} />);
    expect(screen.queryByTestId('sheet-overlay')).toBeNull();
  });

  it('renders the form when open', () => {
    render(<AddInbodySheet open customerId="A" lastRecord={null} onClose={vi.fn()} onAdded={vi.fn()} />);
    expect(screen.getByText('Nhập chỉ số InBody')).toBeInTheDocument();
  });

  it('shows a validation error when required fields are missing', () => {
    render(<AddInbodySheet open customerId="A" lastRecord={null} onClose={vi.fn()} onAdded={vi.fn()} />);
    fireEvent.click(screen.getByText('Lưu kết quả'));
    expect(screen.getByText('Vui lòng nhập đầy đủ và hợp lệ.')).toBeInTheDocument();
  });

  it('submits valid data and calls onAdded + onClose', async () => {
    const record = { id: '1', customer_id: 'A', height: 170, weight: 65, SMM: 30, BFM: 15, date_recorded: '2024-01-01' };
    vi.mocked(adminApi.addInbody).mockResolvedValue(record);
    const onAdded = vi.fn();
    const onClose = vi.fn();
    render(<AddInbodySheet open customerId="A" lastRecord={null} onClose={onClose} onAdded={onAdded} />);

    fireEvent.change(screen.getByPlaceholderText('170'), { target: { value: '170' } });
    fireEvent.change(screen.getByPlaceholderText('60'), { target: { value: '65' } });
    const zeroInputs = screen.getAllByPlaceholderText('0.0');
    fireEvent.change(zeroInputs[0], { target: { value: '30' } });
    fireEvent.change(zeroInputs[1], { target: { value: '15' } });

    fireEvent.click(screen.getByText('Lưu kết quả'));

    await waitFor(() => expect(onAdded).toHaveBeenCalledWith(record));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('closes via the Hủy button', () => {
    const onClose = vi.fn();
    render(<AddInbodySheet open customerId="A" lastRecord={null} onClose={onClose} onAdded={vi.fn()} />);
    fireEvent.click(screen.getByText('Hủy'));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
