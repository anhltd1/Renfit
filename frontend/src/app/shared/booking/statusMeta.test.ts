import { describe, it, expect } from 'vitest';
import { createElement } from 'react';
import { render, screen } from '@testing-library/react';
import { CalendarCheck, CheckCheck, Clock, UserX, X } from 'lucide-react';
import {
  bookingAccessibleName,
  bookingStatusLabel,
  bookingStatusMeta,
  formatBookingTime,
  type BookingStatusKey,
} from './statusMeta';
import { StatusBadge } from './StatusBadge';

const ALL: BookingStatusKey[] = ['pending', 'approved', 'rejected', 'completed', 'no_show'];

describe('bookingStatusMeta', () => {
  it('defines label, icon, tone and border for every status', () => {
    for (const k of ALL) {
      const m = bookingStatusMeta[k];
      expect(m.label).toBeTruthy();
      expect(m.Icon).toBeTruthy();
      expect(m.pillClass).toBeTruthy();
      expect(m.textClass).toMatch(/^text-/);
      expect(['solid', 'dashed']).toContain(m.borderStyle);
    }
  });

  it('matches DESIGN.md booking_status labels and icons', () => {
    expect(bookingStatusMeta.pending).toMatchObject({ label: 'Chờ duyệt', Icon: Clock, recede: false });
    expect(bookingStatusMeta.approved).toMatchObject({ label: 'Đã duyệt', Icon: CalendarCheck, borderStyle: 'solid' });
    expect(bookingStatusMeta.completed).toMatchObject({ label: 'Đã tập', Icon: CheckCheck, recede: true });
    expect(bookingStatusMeta.no_show).toMatchObject({ label: 'Vắng', Icon: UserX, recede: false });
    expect(bookingStatusMeta.rejected).toMatchObject({
      label: 'Từ chối',
      Icon: X,
      borderStyle: 'dashed',
      recede: true,
      strike: true,
    });
  });

  it('never uses the fill-only primary #0F6B3E for status text', () => {
    for (const k of ALL) {
      expect(bookingStatusMeta[k].pillClass.toLowerCase()).not.toContain('0f6b3e');
      expect(bookingStatusMeta[k].textClass.toLowerCase()).not.toContain('0f6b3e');
    }
  });
});

describe('bookingStatusLabel', () => {
  it('maps known statuses and falls back to the raw string', () => {
    expect(bookingStatusLabel('no_show')).toBe('Vắng');
    expect(bookingStatusLabel('weird')).toBe('weird');
  });
});

describe('bookingAccessibleName', () => {
  it('contains name, formatted time and status label', () => {
    // 2026-10-29 is a Thursday → T5.
    expect(
      bookingAccessibleName({ customer_id: 'Nguyễn Văn A', time: '2026-10-29T07:00', status: 'approved' }),
    ).toBe('Nguyễn Văn A · T5 29/10 07:00 · Đã duyệt');
  });

  it('omits the time when absent', () => {
    expect(bookingAccessibleName({ customer_id: 'Lan', status: 'pending' })).toBe('Lan · Chờ duyệt');
  });

  it('formats Sunday as CN and keeps unparseable times verbatim', () => {
    expect(formatBookingTime('2026-11-01T18:30:00')).toBe('CN 01/11 18:30');
    expect(formatBookingTime('07:00')).toBe('07:00');
  });
});

describe('StatusBadge', () => {
  it('renders icon + label', () => {
    render(createElement(StatusBadge, { status: 'completed', size: 'md' }));
    const el = screen.getByTestId('status-badge-completed');
    expect(el).toHaveTextContent('Đã tập');
    expect(el.querySelector('svg')).not.toBeNull();
  });

  it('renders unknown statuses with the raw value', () => {
    render(createElement(StatusBadge, { status: 'cancelled' }));
    expect(screen.getByTestId('status-badge-cancelled')).toHaveTextContent('cancelled');
  });
});
