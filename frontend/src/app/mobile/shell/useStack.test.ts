import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { renderHook, act } from '@testing-library/react';
import { useStack } from './useStack';

describe('useStack (example-based)', () => {
  it('starts with the initial screen as current', () => {
    const { result } = renderHook(() => useStack('root'));
    expect(result.current.current).toBe('root');
    expect(result.current.canPop).toBe(false);
  });

  it('push adds a screen and makes it current', () => {
    const { result } = renderHook(() => useStack('root'));
    act(() => result.current.push('detail'));
    expect(result.current.current).toBe('detail');
    expect(result.current.canPop).toBe(true);
  });

  it('pop returns to the previous screen', () => {
    const { result } = renderHook(() => useStack('root'));
    act(() => result.current.push('detail'));
    act(() => result.current.pop());
    expect(result.current.current).toBe('root');
    expect(result.current.canPop).toBe(false);
  });

  it('pop on the root screen is a no-op', () => {
    const { result } = renderHook(() => useStack('root'));
    act(() => result.current.pop());
    expect(result.current.current).toBe('root');
    expect(result.current.stack).toEqual(['root']);
  });

  it('reset replaces the whole stack with a single screen', () => {
    const { result } = renderHook(() => useStack('root'));
    act(() => result.current.push('a'));
    act(() => result.current.push('b'));
    act(() => result.current.reset('overview'));
    expect(result.current.stack).toEqual(['overview']);
    expect(result.current.canPop).toBe(false);
  });
});

describe('useStack (property-based, PBT-03 invariants)', () => {
  it('stack length is always >= 1 after any sequence of push/pop', () => {
    fc.assert(
      fc.property(fc.array(fc.constantFrom('push', 'pop'), { minLength: 0, maxLength: 30 }), (ops) => {
        const { result } = renderHook(() => useStack('root'));
        let i = 0;
        for (const op of ops) {
          act(() => {
            if (op === 'push') result.current.push(`screen-${i++}`);
            else result.current.pop();
          });
        }
        return result.current.stack.length >= 1;
      }),
    );
  });

  it('push then pop returns to the exact prior stack (round-trip)', () => {
    fc.assert(
      fc.property(fc.string(), (screen) => {
        const { result } = renderHook(() => useStack('root'));
        const before = [...result.current.stack];
        act(() => result.current.push(screen));
        act(() => result.current.pop());
        return JSON.stringify(result.current.stack) === JSON.stringify(before);
      }),
    );
  });
});
