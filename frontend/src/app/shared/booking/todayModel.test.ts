import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { pickCurrentAndNext, groupPendingByDay, countdownLabel } from './todayModel';
import type { PendingBooking, TodaySession } from '../../../lib/api/admin';

// 2026-10-31 09:30 ICT = 02:30 UTC
const NOW = new Date('2026-10-31T02:30:00Z');

const ses = (time: string, status = 'approved', id = time): TodaySession =>
  ({ id, time, hour: +time.slice(11, 13), customer_id: `C${id}`, customer_goal: '', status }) as TodaySession;
const pen = (time: string, id = time): PendingBooking =>
  ({ id, time, hour: +time.slice(11, 13), customer_id: `C${id}`, note: '' });

describe('todayModel (example-based)', () => {
  it('picks current and next', () => {
    const r = pickCurrentAndNext(
      [ses('2026-10-31T11:00'), ses('2026-10-31T09:00'), ses('2026-10-31T07:00', 'completed')],
      NOW,
    );
    expect(r.current?.time).toBe('2026-10-31T09:00');
    expect(r.next?.time).toBe('2026-10-31T11:00');
  });
  it('ignores rejected and has no current when nothing runs', () => {
    const r = pickCurrentAndNext([ses('2026-10-31T09:00', 'rejected'), ses('2026-10-31T10:00')], NOW);
    expect(r.current).toBeUndefined();
    expect(r.next?.time).toBe('2026-10-31T10:00');
  });
  it('groups pending with labels', () => {
    const g = groupPendingByDay([pen('2026-11-02T08:00'), pen('2026-10-31T10:00'), pen('2026-11-01T07:00'), pen('2026-10-31T08:00')], NOW);
    expect(g.map((x) => x.label)).toEqual(['Hôm nay', 'Ngày mai', 'T2 02/11']);
    expect(g[0].items.map((i) => i.time)).toEqual(['2026-10-31T08:00', '2026-10-31T10:00']);
    expect(groupPendingByDay([pen('2026-11-05T08:00')], NOW)[0].label).toBe('T5 05/11');
  });
  it('countdown labels', () => {
    expect(countdownLabel('2026-10-31T09:55', NOW)).toBe('Bắt đầu sau 25 phút');
    expect(countdownLabel('2026-10-31T09:00', NOW)).toBe('Đang tập · còn 30 phút');
    expect(countdownLabel('2026-10-31T12:00', NOW)).toBe('Bắt đầu sau 2 giờ 30 phút');
  });
});

describe('todayModel (property-based)', () => {
  const timeArb = fc
    .record({ d: fc.integer({ min: 28, max: 31 }), h: fc.integer({ min: 6, max: 21 }) })
    .map(({ d, h }) => `2026-10-${d}T${String(h).padStart(2, '0')}:00`);
  const statusArb = fc.constantFrom('approved', 'completed', 'no_show', 'rejected');

  it('grouping keeps every item, sorted', () => {
    fc.assert(
      fc.property(fc.array(timeArb, { maxLength: 30 }), (times) => {
        const items = times.map((t, i) => pen(t, String(i)));
        const g = groupPendingByDay(items, NOW);
        expect(g.flatMap((x) => x.items)).toHaveLength(items.length);
        expect(g.map((x) => x.date)).toEqual([...g.map((x) => x.date)].sort());
        g.forEach((x) => expect(x.items.map((i) => i.time)).toEqual([...x.items.map((i) => i.time)].sort()));
      }),
    );
  });
  it('current and next are never the same booking', () => {
    fc.assert(
      fc.property(
        fc.array(fc.tuple(timeArb, statusArb), { maxLength: 20 }),
        (rows) => {
          const r = pickCurrentAndNext(rows.map(([t, s], i) => ses(t, s, String(i))), NOW);
          if (r.current && r.next) expect(r.current.id).not.toBe(r.next.id);
          expect(r.current?.status).not.toBe('rejected');
          expect(r.next?.status).not.toBe('rejected');
        },
      ),
    );
  });
});
