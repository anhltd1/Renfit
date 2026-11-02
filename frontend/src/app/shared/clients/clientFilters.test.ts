import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import type { CustomerSummary } from '../../../lib/api/admin';
import {
  CLIENT_FILTERS,
  filterClients,
  ictDateString,
  ictWeekRange,
  matchesClientFilter,
  sortClients,
} from './clientFilters';

function mk(id: string, extra: Partial<CustomerSummary> = {}): CustomerSummary {
  return {
    id,
    phone_number: '0900000000',
    goal: '',
    health_note: '',
    address: '',
    height: '',
    weight: '',
    avatar: '',
    age: null,
    ...extra,
  };
}

// Wed 2026-08-05 10:00 ICT → week Mon 08-03 … Sun 08-09
const NOW = new Date('2026-08-05T03:00:00Z');

describe('ICT helpers', () => {
  it('rolls the date over at 17:00 UTC', () => {
    expect(ictDateString(new Date('2026-08-05T16:59:00Z'))).toBe('2026-08-05');
    expect(ictDateString(new Date('2026-08-05T17:00:00Z'))).toBe('2026-08-06');
  });
  it('week runs Monday–Sunday', () => {
    expect(ictWeekRange(NOW)).toEqual({ start: '2026-08-03', end: '2026-08-09' });
    // Sunday belongs to the week that started the previous Monday
    expect(ictWeekRange(new Date('2026-08-09T03:00:00Z'))).toEqual({ start: '2026-08-03', end: '2026-08-09' });
  });
});

describe('client filters', () => {
  it('active treats a missing flag as active', () => {
    expect(matchesClientFilter(mk('a'), 'active', NOW)).toBe(true);
    expect(matchesClientFilter(mk('a', { active: true }), 'active', NOW)).toBe(true);
    expect(matchesClientFilter(mk('a', { active: false }), 'active', NOW)).toBe(false);
    expect(matchesClientFilter(mk('a', { active: false }), 'archived', NOW)).toBe(true);
  });

  it('booked_this_week uses next_session within Mon–Sun', () => {
    expect(matchesClientFilter(mk('a', { next_session: '2026-08-09T19:00' }), 'booked_this_week', NOW)).toBe(true);
    expect(matchesClientFilter(mk('a', { next_session: '2026-08-06T08:00' }), 'booked_this_week', NOW)).toBe(true);
    expect(matchesClientFilter(mk('a', { next_session: '2026-08-10T08:00' }), 'booked_this_week', NOW)).toBe(false);
    expect(matchesClientFilter(mk('a'), 'booked_this_week', NOW)).toBe(false);
  });

  it("booked_this_week counts today's session (stored as last_session) but not earlier ones", () => {
    expect(matchesClientFilter(mk('a', { last_session: '2026-08-05T08:00' }), 'booked_this_week', NOW)).toBe(true);
    expect(matchesClientFilter(mk('a', { last_session: '2026-08-04T08:00' }), 'booked_this_week', NOW)).toBe(false);
  });

  it('booked_this_week excludes archived members', () => {
    expect(
      matchesClientFilter(mk('a', { active: false, next_session: '2026-08-06T08:00' }), 'booked_this_week', NOW),
    ).toBe(false);
  });

  it('inactive_14d: never trained, or last session older than 14 days', () => {
    expect(matchesClientFilter(mk('a'), 'inactive_14d', NOW)).toBe(true);
    expect(matchesClientFilter(mk('a', { last_session: '2026-07-21T08:00' }), 'inactive_14d', NOW)).toBe(true);
    // exactly 14 days ago is still within the window
    expect(matchesClientFilter(mk('a', { last_session: '2026-07-22T08:00' }), 'inactive_14d', NOW)).toBe(false);
    expect(matchesClientFilter(mk('a', { last_session: '2026-08-04T08:00' }), 'inactive_14d', NOW)).toBe(false);
    expect(matchesClientFilter(mk('a', { active: false }), 'inactive_14d', NOW)).toBe(false);
  });

  it('filterClients keeps order and only matching members', () => {
    const list = [mk('a'), mk('b', { active: false }), mk('c')];
    expect(filterClients(list, 'active', NOW).map((c) => c.id)).toEqual(['a', 'c']);
    expect(filterClients(list, 'archived', NOW).map((c) => c.id)).toEqual(['b']);
  });

  it('property: active and archived are disjoint and cover every member', () => {
    const dateArb = fc
      .date({ min: new Date('2026-01-01'), max: new Date('2026-12-31'), noInvalidDate: true })
      .map((d) => d.toISOString().slice(0, 16));
    const customerArb = fc.record({
      id: fc.string({ minLength: 1, maxLength: 8 }),
      active: fc.option(fc.boolean(), { nil: undefined }),
      last_session: fc.option(dateArb, { nil: null }),
      next_session: fc.option(dateArb, { nil: null }),
    });
    fc.assert(
      fc.property(fc.array(customerArb, { maxLength: 20 }), (rows) => {
        const list = rows.map((r) => mk(r.id, r));
        const active = filterClients(list, 'active', NOW);
        const archived = filterClients(list, 'archived', NOW);
        expect(active.length + archived.length).toBe(list.length);
        expect(active.some((c) => archived.includes(c))).toBe(false);
        // week/inactive filters only ever return active members
        for (const f of CLIENT_FILTERS) {
          if (f === 'archived') continue;
          expect(filterClients(list, f, NOW).every((c) => c.active !== false)).toBe(true);
        }
      }),
    );
  });
});

describe('sortClients', () => {
  const list = [
    mk('Binh', { last_session: '2026-08-01T08:00', next_session: '2026-08-09T08:00' }),
    mk('An', { active: false }),
    mk('Chi', { last_session: '2026-07-01T08:00', next_session: '2026-08-06T08:00' }),
  ];
  it('puts archived last and sorts A–Z by default', () => {
    expect(sortClients(list, 'alpha').map((c) => c.id)).toEqual(['Binh', 'Chi', 'An']);
  });
  it('lastSession: oldest first; nextSession: soonest first', () => {
    expect(sortClients(list, 'lastSession').map((c) => c.id)).toEqual(['Chi', 'Binh', 'An']);
    expect(sortClients(list, 'nextSession').map((c) => c.id)).toEqual(['Chi', 'Binh', 'An']);
  });
  it('does not mutate its input', () => {
    const copy = [...list];
    sortClients(list, 'alpha');
    expect(list).toEqual(copy);
  });
});
