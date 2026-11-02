import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
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
    fetchNotes: vi.fn().mockResolvedValue([]),
    archiveMember: vi.fn(),
    restoreMember: vi.fn(),
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

  describe('calm one-column layout', () => {
    it('shows one section at a time: InBody by default, Ghi chú after switching tabs', async () => {
      vi.mocked(adminApi.fetchInbody).mockResolvedValue([]);
      render(<CustomerDetail customer={customer} />);

      expect(screen.getByTestId('detail-tab-inbody')).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByTestId('detail-tab-notes')).toHaveAttribute('aria-selected', 'false');
      expect(screen.getByRole('tabpanel')).toHaveAttribute('aria-labelledby', 'detail-tab-inbody');
      expect(screen.queryByTestId('trainer-notes')).toBeNull();

      fireEvent.click(screen.getByTestId('detail-tab-notes'));
      expect(screen.getByTestId('detail-tab-notes')).toHaveAttribute('aria-selected', 'true');
      expect(await screen.findByTestId('trainer-notes')).toBeInTheDocument();
      expect(adminApi.fetchNotes).toHaveBeenCalledWith(customer.id);
      // Embedded: the tab is the title, so no second "Ghi chú HLV" heading.
      expect(screen.queryByText('Ghi chú HLV')).toBeNull();
    });

    it('arrow keys move between the tabs', () => {
      vi.mocked(adminApi.fetchInbody).mockResolvedValue([]);
      render(<CustomerDetail customer={customer} />);
      fireEvent.keyDown(screen.getByTestId('detail-tab-inbody'), { key: 'ArrowRight' });
      expect(screen.getByTestId('detail-tab-notes')).toHaveAttribute('aria-selected', 'true');
      fireEvent.keyDown(screen.getByTestId('detail-tab-notes'), { key: 'ArrowLeft' });
      expect(screen.getByTestId('detail-tab-inbody')).toHaveAttribute('aria-selected', 'true');
    });

    it('collapses identity facts into one line (phone · age · measures · address)', () => {
      vi.mocked(adminApi.fetchInbody).mockResolvedValue([]);
      render(<CustomerDetail customer={customer} />);
      expect(screen.getByText('170 cm · 65 kg')).toBeInTheDocument();
      expect(screen.queryByText('Số đo đăng ký')).toBeNull();
    });

    it('only calls out health notes that matter', () => {
      vi.mocked(adminApi.fetchInbody).mockResolvedValue([]);
      const { rerender } = render(<CustomerDetail customer={{ ...customer, health_note: 'Không có' }} />);
      expect(screen.queryByTestId('customer-health-note')).toBeNull();

      rerender(<CustomerDetail customer={{ ...customer, health_note: 'Đau gối trái, tránh squat nặng' }} />);
      expect(screen.getByTestId('customer-health-note')).toHaveTextContent('Đau gối trái, tránh squat nặng');
    });
  });

  it('does not render an onBack button (desktop-only, no back navigation)', () => {
    vi.mocked(adminApi.fetchInbody).mockResolvedValue([]);
    render(<CustomerDetail customer={customer} />);
    expect(screen.queryByText('Danh sách hội viên')).toBeNull();
  });

  // Full detail panel (notes + InBody + dialog + toast portals) is slow under a
  // loaded parallel run; give these flows headroom over the 5 s default.
  describe('archive / restore (U21)', { timeout: 15000 }, () => {
    it('asks for confirmation before archiving, then archives + toasts + refreshes', async () => {
      vi.mocked(adminApi.fetchInbody).mockResolvedValue([]);
      vi.mocked(adminApi.archiveMember).mockResolvedValue(undefined);
      const onRefresh = vi.fn();
      render(<CustomerDetail customer={customer} onRefresh={onRefresh} />);

      const btn = screen.getByTestId('customer-detail-archive');
      expect(btn).toHaveClass('tap-target');
      fireEvent.click(btn);
      expect(adminApi.archiveMember).not.toHaveBeenCalled();
      expect(screen.getByText('Đánh dấu Nguyen Van A đã nghỉ?')).toBeInTheDocument();
      expect(
        screen.getByText('Hội viên sẽ được ẩn khỏi danh sách mặc định. Lịch sử vẫn được giữ lại.'),
      ).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: 'Đánh dấu đã nghỉ' }));
      await waitFor(() => expect(adminApi.archiveMember).toHaveBeenCalledWith('Nguyen Van A'));
      expect(await screen.findByText('Đã chuyển Nguyen Van A sang Đã nghỉ.')).toBeInTheDocument();
      expect(onRefresh).toHaveBeenCalledOnce();
      expect(screen.queryByTestId('confirm-dialog')).toBeNull();
    });

    it('cancelling the confirmation does nothing', () => {
      vi.mocked(adminApi.fetchInbody).mockResolvedValue([]);
      render(<CustomerDetail customer={customer} />);
      fireEvent.click(screen.getByTestId('customer-detail-archive'));
      fireEvent.click(screen.getByTestId('confirm-dialog-cancel'));
      expect(adminApi.archiveMember).not.toHaveBeenCalled();
      expect(screen.queryByTestId('confirm-dialog')).toBeNull();
    });

    it('shows an error toast when archiving fails (no unhandled rejection)', async () => {
      vi.mocked(adminApi.fetchInbody).mockResolvedValue([]);
      vi.mocked(adminApi.archiveMember).mockRejectedValue(new Error('Mất kết nối.'));
      const onRefresh = vi.fn();
      render(<CustomerDetail customer={customer} onRefresh={onRefresh} />);
      fireEvent.click(screen.getByTestId('customer-detail-archive'));
      fireEvent.click(screen.getByTestId('confirm-dialog-confirm'));
      expect(await screen.findByTestId('toast-err')).toHaveTextContent('Mất kết nối.');
      expect(onRefresh).not.toHaveBeenCalled();
    });

    it('restores an archived member without a confirmation', async () => {
      vi.mocked(adminApi.fetchInbody).mockResolvedValue([]);
      vi.mocked(adminApi.restoreMember).mockResolvedValue(undefined);
      const onRefresh = vi.fn();
      render(<CustomerDetail customer={{ ...customer, active: false }} onRefresh={onRefresh} />);
      fireEvent.click(screen.getByTestId('customer-detail-restore'));
      expect(screen.queryByTestId('confirm-dialog')).toBeNull();
      await waitFor(() => expect(adminApi.restoreMember).toHaveBeenCalledWith('Nguyen Van A'));
      expect(await screen.findByText('Đã khôi phục Nguyen Van A.')).toBeInTheDocument();
      expect(onRefresh).toHaveBeenCalledOnce();
    });
  });
});
