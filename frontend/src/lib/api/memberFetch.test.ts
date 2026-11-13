import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { memberFetch } from './memberFetch';

const store = new Map<string, string>();
const assign = vi.fn();

beforeEach(() => {
  store.clear();
  assign.mockReset();
  vi.stubGlobal('localStorage', {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
  });
  vi.stubGlobal('location', { pathname: '/', assign });
  Object.defineProperty(window, 'location', { value: { pathname: '/', assign }, configurable: true });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function mockFetch(status: number) {
  const fn = vi.fn().mockResolvedValue(new Response('{}', { status }));
  vi.stubGlobal('fetch', fn);
  return fn;
}

describe('memberFetch', () => {
  it('never redirects an anonymous visitor on a 401 (public landing page)', async () => {
    const fetchFn = mockFetch(401);
    await memberFetch('/api/v1/bookings/availability');
    expect(fetchFn.mock.calls[0][1].headers).not.toHaveProperty('Authorization');
    expect(assign).not.toHaveBeenCalled();
  });

  it('sends the bearer token when a member is logged in', async () => {
    store.set('renfit_user', JSON.stringify({ id: 'A', token: 'tok-123' }));
    const fetchFn = mockFetch(200);
    await memberFetch('/api/v1/profile/inbody');
    expect(fetchFn.mock.calls[0][1].headers).toMatchObject({ Authorization: 'Bearer tok-123' });
    expect(assign).not.toHaveBeenCalled();
  });

  it('clears an expired session and sends the member to /login', async () => {
    store.set('renfit_user', JSON.stringify({ id: 'A', token: 'tok-123' }));
    mockFetch(401);
    await memberFetch('/api/v1/profile/inbody');
    expect(store.has('renfit_user')).toBe(false);
    expect(assign).toHaveBeenCalledWith('/login');
  });
});
