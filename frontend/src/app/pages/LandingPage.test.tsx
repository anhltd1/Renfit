import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router';
import { LandingPage } from './LandingPage';

// Mock IntersectionObserver for jsdom
beforeEach(() => {
  vi.stubGlobal(
    'IntersectionObserver',
    class MockIO {
      constructor() {}
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
      root = null;
      rootMargin = '';
      thresholds = [];
      takeRecords = () => [];
    },
  );

  // Reduced motion OFF so elements start unrevealed (but hook returns immediately in jsdom anyway)
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

// Known application routes (for footer link validation)
const APP_ROUTES = ['/', '/login', '/signup', '/dashboard', '/admin', '/admin/dashboard'];

function renderLandingPage() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <LandingPage />
    </MemoryRouter>,
  );
}

describe('LandingPage', () => {
  describe('Navigation anchor resolution', () => {
    it('every nav anchor with href starting # has a matching id in the rendered output', () => {
      const { container } = renderLandingPage();

      // Find all anchors in the navigation that are in-page links
      const navAnchors = container.querySelectorAll('nav a[href^="#"]');
      expect(navAnchors.length).toBeGreaterThan(0);

      for (const anchor of navAnchors) {
        const href = anchor.getAttribute('href')!;
        const targetId = href.slice(1); // remove the #
        const targetElement = container.querySelector(`[id="${targetId}"]`);
        expect(
          targetElement,
          `Navigation anchor "${href}" has no matching element with id="${targetId}"`,
        ).not.toBeNull();
      }
    });

    it('renders at least 3 nav anchors (about, services, trainers)', () => {
      const { container } = renderLandingPage();
      const navAnchors = container.querySelectorAll('nav a[href^="#"]');
      expect(navAnchors.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Footer link resolution', () => {
    it('every footer link resolves to a rendered section id or an application route', () => {
      const { container } = renderLandingPage();

      const footerEl = container.querySelector('footer');
      expect(footerEl).not.toBeNull();

      const footerLinks = footerEl!.querySelectorAll('a[href]');
      expect(footerLinks.length).toBeGreaterThan(0);

      for (const link of footerLinks) {
        const href = link.getAttribute('href')!;

        if (href.startsWith('#')) {
          // In-page anchor — must have a matching id
          const targetId = href.slice(1);
          const targetElement = container.querySelector(`[id="${targetId}"]`);
          expect(
            targetElement,
            `Footer link "${href}" has no matching element with id="${targetId}"`,
          ).not.toBeNull();
        } else if (href.startsWith('/')) {
          // App route — must be in the known routes
          expect(
            APP_ROUTES,
            `Footer link "${href}" is not a known application route`,
          ).toContain(href);
        } else if (href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:')) {
          // External link, mailto, or tel — acceptable
        } else {
          // Bare "#" or unknown — should not exist
          expect(href, `Footer link has invalid href: "${href}"`).not.toBe('#');
        }
      }
    });

    it('no footer link has href="#" (bare placeholder fragment)', () => {
      const { container } = renderLandingPage();
      const footerEl = container.querySelector('footer');
      const bareFragments = footerEl!.querySelectorAll('a[href="#"]');
      expect(bareFragments.length).toBe(0);
    });
  });

  describe('Dead code removal', () => {
    it('does not render Pricing or Testimonials text', () => {
      renderLandingPage();
      // These components had specific headings
      expect(screen.queryByText('Gói Thành Viên')).toBeNull();
      expect(screen.queryByText(/Testimonials/i)).toBeNull();
    });
  });
});
