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

  // U21: the single "Vui lòng nhập đầy đủ và hợp lệ." banner became per-field errors.
  it('shows a per-field error for each missing required field', () => {
    render(<AddInbodySheet open customerId="A" lastRecord={null} onClose={vi.fn()} onAdded={vi.fn()} />);
    fireEvent.click(screen.getByText('Lưu kết quả'));
    for (const f of ['height', 'weight', 'SMM', 'BFM']) {
      expect(screen.getByTestId(`inbody-error-${f}`)).toBeInTheDocument();
      expect(screen.getByTestId(`inbody-input-${f}`)).toHaveAttribute('inputmode', 'decimal');
    }
  });

  it('blocks out-of-range values and warns on > 10 % change', () => {
    const last = { id: '0', customer_id: 'A', height: 170, weight: 60, SMM: 30, BFM: 15, date_recorded: '2024-01-01' };
    render(<AddInbodySheet open customerId="A" lastRecord={last} onClose={vi.fn()} onAdded={vi.fn()} />);
    fireEvent.change(screen.getByTestId('inbody-input-SMM'), { target: { value: '90' } });
    fireEvent.change(screen.getByTestId('inbody-input-BFM'), { target: { value: '20' } });
    expect(screen.getByTestId('inbody-warning-BFM')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Lưu kết quả'));
    expect(screen.getByTestId('inbody-error-SMM')).toHaveTextContent('phải từ 5 đến 80 kg');
    expect(adminApi.addInbody).not.toHaveBeenCalled();
  });

  it('shows the change vs the previous record in the success toast (U24, FR-12)', async () => {
    const last = { id: '0', customer_id: 'A', height: 170, weight: 60, SMM: 30, BFM: 15, date_recorded: '2024-01-01' };
    vi.mocked(adminApi.addInbody).mockResolvedValue({ ...last, id: '1', weight: 58.8, SMM: 30.4, BFM: 14.2 });
    render(<AddInbodySheet open customerId="A" lastRecord={last} onClose={vi.fn()} onAdded={vi.fn()} />);
    fireEvent.change(screen.getByTestId('inbody-input-weight'), { target: { value: '58,8' } });
    fireEvent.change(screen.getByTestId('inbody-input-SMM'), { target: { value: '30.4' } });
    fireEvent.change(screen.getByTestId('inbody-input-BFM'), { target: { value: '14.2' } });
    fireEvent.click(screen.getByText('Lưu kết quả'));
    expect(
      await screen.findByText('Đã lưu kết quả InBody. Cân nặng −1.2 kg · Cơ +0.4 kg · Mỡ −0.8 kg'),
    ).toBeInTheDocument();
  });

  it('asks before discarding unsaved changes via Hủy', () => {
    const onClose = vi.fn();
    render(<AddInbodySheet open customerId="A" lastRecord={null} onClose={onClose} onAdded={vi.fn()} />);
    fireEvent.change(screen.getByTestId('inbody-input-weight'), { target: { value: '65' } });
    fireEvent.click(screen.getByText('Hủy'));
    expect(onClose).not.toHaveBeenCalled();
    fireEvent.click(screen.getByTestId('confirm-dialog-cancel'));
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByTestId('inbody-input-weight')).toHaveValue('65');
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
