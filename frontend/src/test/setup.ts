// Global test setup — registers @testing-library/jest-dom matchers
// (toBeInTheDocument, toHaveClass, etc.) and cleans up the DOM between tests.
import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
});

// jsdom does not implement matchMedia. Several components (the legacy
// useIsMobile hook, and anything using CSS media queries in JS) call it
// directly, so provide a default no-op stub. Tests that need specific
// matchMedia behavior (e.g. DeviceProvider.test.tsx) override this locally.
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

// jsdom does not implement ResizeObserver, which recharts' ResponsiveContainer
// (used by the InBody charts) requires. A no-op stub is enough for tests that
// only assert on rendered content, not real resize behavior.
if (typeof window !== 'undefined' && !window.ResizeObserver) {
  window.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
}

// jsdom does not implement Element.prototype.scrollTo/scrollIntoView, which
// several components call directly (ChatPanel's auto-scroll, OnboardingTour's
// scrollIntoView). No-op stubs are enough since tests don't assert on actual
// scroll position.
if (typeof Element !== 'undefined') {
  if (!Element.prototype.scrollTo) {
    Element.prototype.scrollTo = () => {};
  }
  if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = () => {};
  }
}
