import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import type { Availability } from '../../../lib/api/bookings';
import {
  countdownLabel,
  dayLabel,
  formatSigned,
  formatVi,
  getNextSession,
  getOpenSlots,
  summarizeInbody,
} from './memberHomeModel';

const slot = (hour: number, over: Partial<Availability['days'][0]['slots'][0]> = {}) => ({
  hour,
  time: `${hour}:00`,
  count: 1,
  remaining: 3,
  full: false,
  past: false,
  my_status: null,
  my_booking_id: null,
  available: true,
  ...over,
});

// Monday 9 Nov 2026, 14:20 at the gym.
const NOW = new Date(2026, 10, 9, 14, 20);

const av: Availability = {
  capacity: 4,
  days: [
    {
      date: '2026-11-09',
      weekday: 0,
      label: 'T2',
      slots: [slot(9, { past: true }), slot(15, { count: 4, full: true, remaining: 0 }), slot(16), slot(17, { count: 2 })],
    },
    {
      date: '2026-11-10',
      weekday: 1,
      label: 'T3',
      slots: [slot(8), slot(18, { my_status: 'approved', my_booking_id: 'b1', count: 3 })],
    },
  ],
};

describe('memberHomeModel (example-based)', () => {
  it('labels days the Vietnamese way', () => {
    expect(dayLabel('2026-11-10')).toBe('T3 10/11');
  });

  it('formats decimals with a comma and signs with a true minus', () => {
    expect(formatVi(72.4)).toBe('72,4');
    expect(formatSigned(-2.4)).toBe('−2,4');
    expect(formatSigned(0.6)).toBe('+0,6');
    expect(formatSigned(0.04)).toBe('0,0');
  });

  it('finds the next upcoming session of mine with its slot occupancy', () => {
    const next = getNextSession(av, NOW)!;
    expect(next).toMatchObject({ day: 'T3 10/11', time: '18:00', status: 'approved', taken: 3, capacity: 4 });
  });

  it('counts down in hours today, "Ngày mai" tomorrow, days after', () => {
    expect(countdownLabel(new Date(2026, 10, 9, 17, 40), NOW)).toBe('Còn 3 giờ 20 phút');
    expect(countdownLabel(new Date(2026, 10, 9, 15, 0), NOW)).toBe('Còn 40 phút');
    expect(countdownLabel(new Date(2026, 10, 10, 18, 0), NOW)).toBe('Ngày mai');
    expect(countdownLabel(new Date(2026, 10, 12, 8, 0), NOW)).toBe('Còn 3 ngày');
    expect(countdownLabel(new Date(2026, 10, 9, 14, 0), NOW)).toBe('Đang diễn ra');
  });

  it('lists open slots from now, skipping past, full and mine', () => {
    const open = getOpenSlots(av, NOW);
    expect(open.map((s) => `${s.date} ${s.time}`)).toEqual([
      '2026-11-09 16:00',
      '2026-11-09 17:00',
      '2026-11-10 08:00',
    ]);
    expect(open[1]).toMatchObject({ taken: 2, isToday: true });
  });

  it('summarizes InBody with deltas against the first measurement', () => {
    const s = summarizeInbody([
      { id: '2', customer_id: 'c', height: 170, weight: 70.0, SMM: 31.0, BFM: 15.2, date_recorded: '2026-11-01' },
      { id: '1', customer_id: 'c', height: 170, weight: 72.4, SMM: 30.1, BFM: 17.6, date_recorded: '2026-08-12' },
    ])!;
    expect(s.baseline).toBe('12/08');
    expect(s.latestDate).toBe('01/11/2026');
    const bfm = s.metrics.find((m) => m.key === 'bfm')!;
    expect(bfm.value).toBe(15.2);
    expect(bfm.delta).toBeCloseTo(-2.4);
    expect(bfm.polarity).toBe('good');
    expect(s.metrics.find((m) => m.key === 'weight')!.polarity).toBe('neutral');
    expect(s.weights.map((w) => w.date)).toEqual(['12/08', '01/11']);
  });

  it('has no baseline or deltas with a single measurement', () => {
    const s = summarizeInbody([
      { id: '1', customer_id: 'c', height: 170, weight: 70, SMM: 31, BFM: 15, date_recorded: '2026-11-01' },
    ])!;
    expect(s.baseline).toBeNull();
    expect(s.metrics.every((m) => m.delta === null && m.polarity === 'neutral')).toBe(true);
  });
});

describe('formatSigned (property-based, round-trip)', () => {
  const deltaArb = fc.double({ min: -50, max: 50, noNaN: true });

  it('parses back to the value rounded to one decimal', () => {
    fc.assert(
      fc.property(deltaArb, (n) => {
        const s = formatSigned(n).replace('−', '-').replace('+', '').replace(',', '.');
        expect(Number(s)).toBeCloseTo(Number(n.toFixed(1)) || 0, 5);
      }),
    );
  });
});
