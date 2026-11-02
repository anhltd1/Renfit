import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CustomerDetailScreen } from './CustomerDetailScreen';
import { DeviceProvider } from '../../device/DeviceProvider';
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
    fetchInbody: vi.fn(async () => []),
    fetchNotes: vi.fn(async () => []),
    fetchAttendance: vi.fn(async (id: string) => ({ customer_id: id, completed: 7, no_show: 2 })),
    archiveMember: vi.fn(async () => undefined),
    restoreMember: vi.fn(async () => undefined),
  };
});

afterEach(() => {
  vi.clearAllMocks();
});

function renderScreen(c: CustomerSummary = customer, onChanged = vi.fn()) {
  const onBack = vi.fn();
  render(
    <DeviceProvider forceDevice="mobile">
      <CustomerDetailScreen customer={c} onBack={onBack} onChanged={onChanged} />
    </DeviceProvider>,
  );
  return { onBack, onChanged };
}

describe('CustomerDetailScreen', { timeout: 15000 }, () => {
  it('renders hero info and detail fields without uppercase labels', async () => {
    renderScreen();
    expect(screen.getAllByText('Nguyen Van A').length).toBeGreaterThan(0);
    expect(screen.getByText('0900000000')).toBeInTheDocument();
    expect(screen.getByText('Giảm mỡ')).toBeInTheDocument();
    expect(screen.getByText('25 tuổi')).toBeInTheDocument();
    expect(screen.getByText('Q1, TP.HCM')).toBeInTheDocument();
    expect(screen.getByText('Tuổi').className).not.toMatch(/uppercase|text-\[11px\]/);
    await waitFor(() => expect(adminApi.fetchInbody).toHaveBeenCalledWith(customer.id));
  });

  it('shows the attendance summary', async () => {
    renderScreen();
    await waitFor(() => expect(screen.getByTestId('attendance-summary')).toHaveTextContent('Đã tập 7'));
    expect(screen.getByTestId('attendance-summary')).toHaveTextContent('Vắng 2');
  });

  it('calls onBack when the back chevron is clicked', () => {
    const { onBack } = renderScreen();
    fireEvent.click(screen.getByTestId('stack-header-back'));
    expect(onBack).toHaveBeenCalledOnce();
  });

  it('Sửa opens the member form in a sheet', async () => {
    renderScreen();
    fireEvent.click(screen.getByTestId('customer-detail-edit'));
    expect(await screen.findByTestId('member-form')).toBeInTheDocument();
    expect(screen.getByTestId('sheet-overlay')).toBeInTheDocument();
  });

  it('archive asks for confirmation, then archives, toasts and reloads', async () => {
    const { onChanged } = renderScreen();
    fireEvent.click(screen.getByTestId('customer-detail-archive'));
    expect(adminApi.archiveMember).not.toHaveBeenCalled();
    expect(screen.getByText('Đánh dấu Nguyen Van A đã nghỉ?')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('confirm-dialog-confirm'));
    await waitFor(() => expect(adminApi.archiveMember).toHaveBeenCalledWith('Nguyen Van A'));
    expect(await screen.findByText('Đã chuyển Nguyen Van A sang Đã nghỉ.')).toBeInTheDocument();
    expect(onChanged).toHaveBeenCalledOnce();
  });

  it('cancelling the confirmation does nothing', () => {
    renderScreen();
    fireEvent.click(screen.getByTestId('customer-detail-archive'));
    fireEvent.click(screen.getByTestId('confirm-dialog-cancel'));
    expect(adminApi.archiveMember).not.toHaveBeenCalled();
  });

  it('restore is direct (no confirmation)', async () => {
    const { onChanged } = renderScreen({ ...customer, active: false });
    fireEvent.click(screen.getByTestId('customer-detail-restore'));
    expect(screen.queryByTestId('confirm-dialog')).toBeNull();
    await waitFor(() => expect(adminApi.restoreMember).toHaveBeenCalledWith('Nguyen Van A'));
    expect(await screen.findByText('Đã khôi phục Nguyen Van A.')).toBeInTheDocument();
    expect(onChanged).toHaveBeenCalledOnce();
  });
});
