import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemberFormModal } from './MemberFormModal';
import * as adminApi from '../../lib/api/admin';
import type { CustomerSummary } from '../../lib/api/admin';
import { DeviceContext, type DeviceState } from '../device/DeviceContext';

vi.mock('../../lib/api/admin', async () => {
  const actual = await vi.importActual<typeof adminApi>('../../lib/api/admin');
  return { ...actual, createMember: vi.fn(), editMember: vi.fn() };
});

afterEach(() => {
  vi.clearAllMocks();
});

const customer: CustomerSummary = {
  id: 'Nguyễn Văn A',
  phone_number: '0900000000',
  goal: 'Giảm cân',
  health_note: '',
  address: '',
  height: '170',
  weight: '65',
  avatar: '',
  age: 25,
};

function fillValidCreate() {
  fireEvent.change(screen.getByLabelText(/Họ và tên/), { target: { value: 'Trần B' } });
  fireEvent.change(screen.getByLabelText(/Số điện thoại/), { target: { value: '0912345678' } });
  fireEvent.change(screen.getByLabelText(/Tuổi/), { target: { value: '30' } });
}

describe('MemberFormModal', () => {
  it('renders as a dialog with associated labels and the right keyboards', () => {
    render(<MemberFormModal mode="create" onClose={vi.fn()} onSaved={vi.fn()} />);
    expect(screen.getByRole('dialog', { name: 'Tạo hội viên mới' })).toBeInTheDocument();
    const phone = screen.getByLabelText(/Số điện thoại/);
    expect(phone).toHaveAttribute('type', 'tel');
    expect(phone).toHaveAttribute('inputmode', 'tel');
    expect(phone).toHaveAttribute('autocomplete', 'tel');
    expect(phone).toHaveAttribute('aria-required', 'true');
    expect(screen.getByLabelText(/Tuổi/)).toHaveAttribute('inputmode', 'numeric');
    expect(screen.getByLabelText(/Chiều cao/)).toHaveAttribute('inputmode', 'decimal');
    expect(screen.getByLabelText(/Cân nặng/)).toHaveAttribute('inputmode', 'decimal');
  });

  it('has no default age in create mode', () => {
    render(<MemberFormModal mode="create" onClose={vi.fn()} onSaved={vi.fn()} />);
    expect(screen.getByLabelText(/Tuổi/)).toHaveValue('');
  });

  it('shows a per-field phone error and does not submit', () => {
    render(<MemberFormModal mode="create" onClose={vi.fn()} onSaved={vi.fn()} />);
    fillValidCreate();
    fireEvent.change(screen.getByLabelText(/Số điện thoại/), { target: { value: '12345' } });
    fireEvent.click(screen.getByTestId('member-form-submit'));
    const phone = screen.getByLabelText(/Số điện thoại/);
    const err = screen.getByTestId('member-form-error-phone');
    expect(err).toHaveTextContent('Số điện thoại phải gồm 10 chữ số và bắt đầu bằng 0.');
    expect(phone).toHaveAttribute('aria-invalid', 'true');
    expect(phone).toHaveAttribute('aria-describedby', err.id);
    expect(adminApi.createMember).not.toHaveBeenCalled();
  });

  it('requires age in create mode', () => {
    render(<MemberFormModal mode="create" onClose={vi.fn()} onSaved={vi.fn()} />);
    fillValidCreate();
    fireEvent.change(screen.getByLabelText(/Tuổi/), { target: { value: '' } });
    fireEvent.click(screen.getByTestId('member-form-submit'));
    expect(screen.getByTestId('member-form-error-age')).toHaveTextContent('Vui lòng nhập tuổi.');
  });

  it('creates a member and shows the temp password with a labelled copy button', async () => {
    vi.mocked(adminApi.createMember).mockResolvedValue({ temporary_password: 'abc123' } as Awaited<
      ReturnType<typeof adminApi.createMember>
    >);
    const onSaved = vi.fn();
    const onClose = vi.fn();
    render(<MemberFormModal mode="create" onClose={onClose} onSaved={onSaved} />);
    fillValidCreate();
    fireEvent.click(screen.getByTestId('member-form-submit'));
    expect(await screen.findByText('abc123')).toBeInTheDocument();
    expect(adminApi.createMember).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Trần B', phone_number: '0912345678', age: 30 }),
    );
    expect(screen.getByRole('button', { name: 'Sao chép mật khẩu' })).toHaveClass('tap-target');
    fireEvent.click(screen.getByTestId('member-form-done'));
    expect(onSaved).toHaveBeenCalledOnce();
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('closes immediately when clean', () => {
    const onClose = vi.fn();
    render(<MemberFormModal mode="create" onClose={onClose} onSaved={vi.fn()} />);
    fireEvent.click(screen.getByTestId('member-form-cancel'));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('asks "Bỏ thay đổi?" before discarding a dirty form (X, Esc, Huỷ)', () => {
    const onClose = vi.fn();
    render(<MemberFormModal mode="create" onClose={onClose} onSaved={vi.fn()} />);
    fireEvent.change(screen.getByLabelText(/Họ và tên/), { target: { value: 'X' } });

    fireEvent.click(screen.getByTestId('modal-close'));
    expect(screen.getByText('Bỏ thay đổi?')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('confirm-dialog-cancel'));
    expect(screen.queryByText('Bỏ thay đổi?')).toBeNull();
    expect(onClose).not.toHaveBeenCalled();

    fireEvent.click(screen.getByTestId('member-form-cancel'));
    fireEvent.click(screen.getByTestId('confirm-dialog-confirm'));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('edit mode: age optional, validated if present, toast on save', async () => {
    vi.mocked(adminApi.editMember).mockResolvedValue(undefined as never);
    const onSaved = vi.fn();
    const showToast = vi.fn();
    render(
      <MemberFormModal mode="edit" customer={customer} onClose={vi.fn()} onSaved={onSaved} showToast={showToast} />,
    );
    expect(screen.queryByLabelText(/Số điện thoại/)).toBeNull();
    const age = screen.getByLabelText(/Tuổi/);
    expect(age).toHaveValue('25');
    expect(age).not.toHaveAttribute('aria-required');

    fireEvent.change(age, { target: { value: '5' } });
    fireEvent.click(screen.getByTestId('member-form-submit'));
    expect(screen.getByTestId('member-form-error-age')).toHaveTextContent('Tuổi phải từ 10 đến 100.');
    expect(adminApi.editMember).not.toHaveBeenCalled();

    fireEvent.change(age, { target: { value: '' } });
    fireEvent.click(screen.getByTestId('member-form-submit'));
    await waitFor(() => expect(onSaved).toHaveBeenCalledOnce());
    expect(vi.mocked(adminApi.editMember).mock.calls[0][1]).not.toHaveProperty('age');
    expect(showToast).toHaveBeenCalledWith({ kind: 'ok', text: 'Đã lưu thay đổi.' });
  });

  it('shows a server error without closing', async () => {
    vi.mocked(adminApi.editMember).mockRejectedValue(new Error('Lỗi máy chủ.'));
    const onSaved = vi.fn();
    render(<MemberFormModal mode="edit" customer={customer} onClose={vi.fn()} onSaved={onSaved} />);
    fireEvent.click(screen.getByTestId('member-form-submit'));
    expect(await screen.findByRole('alert')).toHaveTextContent('Lỗi máy chủ.');
    expect(onSaved).not.toHaveBeenCalled();
  });

  it('renders in a Sheet on mobile', () => {
    const device = { device: 'mobile', isMobile: true, isDesktop: false, override: null, setOverride: () => {} } as DeviceState;
    render(
      <DeviceContext.Provider value={device}>
        <MemberFormModal mode="create" onClose={vi.fn()} onSaved={vi.fn()} />
      </DeviceContext.Provider>,
    );
    expect(screen.getByTestId('sheet-overlay')).toBeInTheDocument();
    expect(screen.queryByTestId('modal-overlay')).toBeNull();
  });
});
