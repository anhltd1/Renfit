import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AddInbodyModal } from './AddInbodyModal';
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

describe('AddInbodyModal', () => {
  it('renders nothing when closed', () => {
    render(<AddInbodyModal open={false} customerId="A" lastRecord={null} onClose={vi.fn()} onAdded={vi.fn()} />);
    expect(screen.queryByTestId('modal-overlay')).toBeNull();
  });

  it('renders the form when open', () => {
    render(<AddInbodyModal open customerId="A" lastRecord={null} onClose={vi.fn()} onAdded={vi.fn()} />);
    expect(screen.getByText('Nhập chỉ số InBody')).toBeInTheDocument();
  });

  // U21: the single "Vui lòng nhập đầy đủ và hợp lệ." banner became per-field errors.
  it('shows a per-field error for each missing required field', () => {
    render(<AddInbodyModal open customerId="A" lastRecord={null} onClose={vi.fn()} onAdded={vi.fn()} />);
    fireEvent.click(screen.getByText('Lưu kết quả'));
    for (const f of ['height', 'weight', 'SMM', 'BFM']) {
      expect(screen.getByTestId(`inbody-error-${f}`)).toBeInTheDocument();
      expect(screen.getByTestId(`inbody-input-${f}`)).toHaveAttribute('aria-invalid', 'true');
    }
    expect(adminApi.addInbody).not.toHaveBeenCalled();
  });

  it('uses the decimal keyboard on every numeric field', () => {
    render(<AddInbodyModal open customerId="A" lastRecord={null} onClose={vi.fn()} onAdded={vi.fn()} />);
    for (const f of ['height', 'weight', 'SMM', 'BFM']) {
      expect(screen.getByTestId(`inbody-input-${f}`)).toHaveAttribute('inputmode', 'decimal');
    }
  });

  it('blocks out-of-range values with an error under the field', () => {
    render(<AddInbodyModal open customerId="A" lastRecord={null} onClose={vi.fn()} onAdded={vi.fn()} />);
    fireEvent.change(screen.getByTestId('inbody-input-height'), { target: { value: '170' } });
    fireEvent.change(screen.getByTestId('inbody-input-weight'), { target: { value: '650' } });
    fireEvent.change(screen.getByTestId('inbody-input-SMM'), { target: { value: '30' } });
    fireEvent.change(screen.getByTestId('inbody-input-BFM'), { target: { value: '15' } });
    fireEvent.click(screen.getByText('Lưu kết quả'));
    const err = screen.getByTestId('inbody-error-weight');
    expect(err).toHaveTextContent('Cân nặng phải từ 25 đến 250 kg.');
    expect(screen.getByTestId('inbody-input-weight').getAttribute('aria-describedby')).toContain(err.id);
    expect(screen.queryByTestId('inbody-error-height')).toBeNull();
    expect(adminApi.addInbody).not.toHaveBeenCalled();
  });

  it('warns (non-blocking) when a value differs from the last record by more than 10 %', async () => {
    const last = { id: '0', customer_id: 'A', height: 170, weight: 60, SMM: 30, BFM: 15, date_recorded: '2024-01-01' };
    vi.mocked(adminApi.addInbody).mockResolvedValue({ ...last, id: '1', weight: 70 });
    const onAdded = vi.fn();
    render(<AddInbodyModal open customerId="A" lastRecord={last} onClose={vi.fn()} onAdded={onAdded} />);
    expect(screen.getAllByText(/Lần trước:/)).toHaveLength(4);
    fireEvent.change(screen.getByTestId('inbody-input-weight'), { target: { value: '70' } });
    fireEvent.change(screen.getByTestId('inbody-input-SMM'), { target: { value: '31' } });
    fireEvent.change(screen.getByTestId('inbody-input-BFM'), { target: { value: '15,5' } });
    expect(screen.getByTestId('inbody-warning-weight')).toHaveTextContent(
      'Chênh lệch hơn 10% so với lần trước — kiểm tra lại.',
    );
    expect(screen.queryByTestId('inbody-warning-SMM')).toBeNull();
    fireEvent.click(screen.getByText('Lưu kết quả'));
    await waitFor(() => expect(onAdded).toHaveBeenCalled());
    expect(vi.mocked(adminApi.addInbody).mock.calls[0][1]).toMatchObject({ weight: 70, BFM: 15.5 });
    // U24 (FR-12): success toast includes the change vs the previous record.
    expect(
      await screen.findByText('Đã lưu kết quả InBody. Cân nặng +10 kg · Cơ +1 kg · Mỡ +0.5 kg'),
    ).toBeInTheDocument();
  });

  it('asks before discarding unsaved changes', () => {
    const onClose = vi.fn();
    render(<AddInbodyModal open customerId="A" lastRecord={null} onClose={onClose} onAdded={vi.fn()} />);
    fireEvent.change(screen.getByTestId('inbody-input-weight'), { target: { value: '65' } });
    fireEvent.click(screen.getByTestId('modal-close'));
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByText('Bỏ thay đổi?')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('confirm-dialog-confirm'));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('submits valid data and calls onAdded + onClose', async () => {
    const record = { id: '1', customer_id: 'A', height: 170, weight: 65, SMM: 30, BFM: 15, date_recorded: '2024-01-01' };
    vi.mocked(adminApi.addInbody).mockResolvedValue(record);
    const onAdded = vi.fn();
    const onClose = vi.fn();
    render(<AddInbodyModal open customerId="A" lastRecord={null} onClose={onClose} onAdded={onAdded} />);

    fireEvent.change(screen.getByPlaceholderText('170'), { target: { value: '170' } });
    fireEvent.change(screen.getByPlaceholderText('60'), { target: { value: '65' } });
    const zeroInputs = screen.getAllByPlaceholderText('0.0');
    fireEvent.change(zeroInputs[0], { target: { value: '30' } });
    fireEvent.change(zeroInputs[1], { target: { value: '15' } });

    fireEvent.click(screen.getByText('Lưu kết quả'));

    await waitFor(() => expect(onAdded).toHaveBeenCalledWith(record));
    expect(onClose).toHaveBeenCalledOnce();
    // No photos picked → the field is omitted entirely.
    expect(vi.mocked(adminApi.addInbody).mock.calls[0][1]).not.toHaveProperty('photos');
  });

  it('sends picked photos with the scores', async () => {
    const profileApi = await import('../../../lib/api/profile');
    vi.spyOn(profileApi, 'compressImageToBase64').mockResolvedValue('data:image/jpeg;base64,AAA');
    vi.mocked(adminApi.addInbody).mockResolvedValue({
      id: '1', customer_id: 'A', height: 170, weight: 65, SMM: 30, BFM: 15, date_recorded: '2024-01-01',
      photos: ['/api/v1/inbody/photos/x'],
    });
    render(<AddInbodyModal open customerId="A" lastRecord={null} onClose={vi.fn()} onAdded={vi.fn()} />);

    fireEvent.change(screen.getByPlaceholderText('170'), { target: { value: '170' } });
    fireEvent.change(screen.getByPlaceholderText('60'), { target: { value: '65' } });
    const zeroInputs = screen.getAllByPlaceholderText('0.0');
    fireEvent.change(zeroInputs[0], { target: { value: '30' } });
    fireEvent.change(zeroInputs[1], { target: { value: '15' } });
    fireEvent.change(screen.getByTestId('photo-picker-input'), {
      target: { files: [new File(['x'], 'a.jpg', { type: 'image/jpeg' })] },
    });
    await screen.findByAltText('Ảnh 1');

    fireEvent.click(screen.getByText('Lưu kết quả'));

    await waitFor(() =>
      expect(adminApi.addInbody).toHaveBeenCalledWith('A', expect.objectContaining({ photos: ['data:image/jpeg;base64,AAA'] })),
    );
  });

  it('closes via the shared Modal close button', () => {
    const onClose = vi.fn();
    render(<AddInbodyModal open customerId="A" lastRecord={null} onClose={onClose} onAdded={vi.fn()} />);
    fireEvent.click(screen.getByTestId('modal-close'));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
