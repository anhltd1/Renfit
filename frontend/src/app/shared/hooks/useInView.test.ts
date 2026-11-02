import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useInView } from './useInView';

describe('useInView', () => {
  let observeMock: ReturnType<typeof vi.fn>;
  let unobserveMock: ReturnType<typeof vi.fn>;
  let disconnectMock: ReturnType<typeof vi.fn>;
  let lastCallback: IntersectionObserverCallback;

  beforeEach(() => {
    observeMock = vi.fn();
    unobserveMock = vi.fn();
    disconnectMock = vi.fn();

    vi.stubGlobal(
      'IntersectionObserver',
      class MockIO {
        constructor(callback: IntersectionObserverCallback) {
          lastCallback = callback;
        }
        observe = observeMock;
        unobserve = unobserveMock;
        disconnect = disconnectMock;
        root = null;
        rootMargin = '';
        thresholds = [];
        takeRecords = () => [];
      },
    );

    // Default: reduced motion is OFF
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      onchange: null,
      dispatchEvent: vi.fn(),
    }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('reveals once on intersection and stays revealed', () => {
    const { result } = renderHook(() => useInView<HTMLDivElement>());

    // Hook starts unrevealed
    expect(result.current.isRevealed).toBe(false);

    // Simulate attaching a DOM node via the callback ref
    const element = document.createElement('div');
    act(() => {
      result.current.ref(element);
    });

    // The observer should have observed the element
    expect(observeMock).toHaveBeenCalledWith(element);

    // Simulate intersection entry
    act(() => {
      lastCallback(
        [{ isIntersecting: true, target: element } as unknown as IntersectionObserverEntry],
        {} as IntersectionObserver,
      );
    });

    expect(result.current.isRevealed).toBe(true);
    expect(unobserveMock).toHaveBeenCalledWith(element);

    // Simulate leaving viewport — should stay revealed (one-time only)
    act(() => {
      lastCallback(
        [{ isIntersecting: false, target: element } as unknown as IntersectionObserverEntry],
        {} as IntersectionObserver,
      );
    });

    expect(result.current.isRevealed).toBe(true);
  });

  it('immediately reveals when prefers-reduced-motion is set', () => {
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      onchange: null,
      dispatchEvent: vi.fn(),
    }));

    const { result } = renderHook(() => useInView());
    expect(result.current.isRevealed).toBe(true);
    // Should not have created an observer
    expect(observeMock).not.toHaveBeenCalled();
  });

  it('immediately reveals when IntersectionObserver is unavailable', () => {
    vi.stubGlobal('IntersectionObserver', undefined);

    const { result } = renderHook(() => useInView());
    expect(result.current.isRevealed).toBe(true);
  });
});
