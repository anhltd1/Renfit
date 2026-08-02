import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';
import { Card } from './Card';
import { Input } from './Input';
import { Modal } from './Modal';
import { Sheet } from './Sheet';
import { Toast } from './Toast';
import { Tabs } from './Tabs';

describe('Button', () => {
  it('renders children and fires onClick', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Đặt lịch</Button>);
    const btn = screen.getByTestId('button-primary');
    expect(btn).toHaveTextContent('Đặt lịch');
    fireEvent.click(btn);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('is disabled and does not fire onClick while loading', () => {
    const onClick = vi.fn();
    render(<Button loading onClick={onClick}>Lưu</Button>);
    const btn = screen.getByTestId('button-primary');
    expect(btn).toBeDisabled();
    fireEvent.click(btn);
    expect(onClick).not.toHaveBeenCalled();
  });
});

describe('Card', () => {
  it('renders content with glassmorphism classes', () => {
    render(<Card>Nội dung</Card>);
    const el = screen.getByText('Nội dung');
    expect(el).toHaveClass('bg-white/5');
    expect(el.className).toContain('backdrop-blur');
  });

  it('is not interactive by default (no button role/tabIndex)', () => {
    render(<Card>Nội dung</Card>);
    const el = screen.getByText('Nội dung');
    expect(el).not.toHaveAttribute('role');
    expect(el).not.toHaveAttribute('tabindex');
  });

  it('becomes keyboard-operable when onClick is passed (U8 Accessibility)', () => {
    const onClick = vi.fn();
    render(<Card onClick={onClick}>Mở hồ sơ</Card>);
    const el = screen.getByText('Mở hồ sơ');
    expect(el).toHaveAttribute('role', 'button');
    expect(el).toHaveAttribute('tabindex', '0');
    fireEvent.click(el);
    expect(onClick).toHaveBeenCalledOnce();
    fireEvent.keyDown(el, { key: 'Enter' });
    expect(onClick).toHaveBeenCalledTimes(2);
    fireEvent.keyDown(el, { key: ' ' });
    expect(onClick).toHaveBeenCalledTimes(3);
  });
});

describe('Input', () => {
  it('renders label + error and accepts input', () => {
    const onChange = vi.fn();
    render(<Input name="phone" label="Số điện thoại" error="Bắt buộc" onChange={onChange} />);
    expect(screen.getByText('Số điện thoại')).toBeInTheDocument();
    expect(screen.getByText('Bắt buộc')).toBeInTheDocument();
    const input = screen.getByTestId('input-phone');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    fireEvent.change(input, { target: { value: '0901' } });
    expect(onChange).toHaveBeenCalled();
  });
});

describe('Modal', () => {
  it('shows when open and closes on backdrop click', () => {
    const onClose = vi.fn();
    render(<Modal open title="Xác nhận" onClose={onClose}>Body</Modal>);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('modal-overlay'));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('renders nothing when closed', () => {
    render(<Modal open={false} onClose={() => {}}>Body</Modal>);
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});

describe('Sheet', () => {
  it('shows when open and closes on backdrop click', () => {
    const onClose = vi.fn();
    render(<Sheet open title="Chọn giờ" onClose={onClose}>Body</Sheet>);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('sheet-overlay'));
    expect(onClose).toHaveBeenCalledOnce();
  });
});

describe('Toast', () => {
  it('renders success and error variants', () => {
    const { rerender } = render(<Toast kind="ok" text="Thành công" />);
    expect(screen.getByTestId('toast-ok')).toHaveTextContent('Thành công');
    rerender(<Toast kind="err" text="Lỗi" />);
    expect(screen.getByTestId('toast-err')).toHaveTextContent('Lỗi');
  });
});

describe('Tabs', () => {
  it('marks the active tab and fires onChange', () => {
    const onChange = vi.fn();
    render(
      <Tabs
        value="overview"
        onChange={onChange}
        items={[
          { key: 'overview', label: 'Tổng quan' },
          { key: 'booking', label: 'Đặt lịch' },
        ]}
      />,
    );
    expect(screen.getByTestId('tab-overview')).toHaveAttribute('aria-selected', 'true');
    fireEvent.click(screen.getByTestId('tab-booking'));
    expect(onChange).toHaveBeenCalledWith('booking');
  });
});
