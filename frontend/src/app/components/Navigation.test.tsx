import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import fc from 'fast-check';
import { Navigation } from './Navigation';
import * as authModule from '../../lib/auth';

// Mock auth to simulate unauthenticated user
vi.mock('../../lib/auth', () => ({
  getAuthUser: vi.fn(() => null),
  clearAuthUser: vi.fn(),
}));

function renderMobileMenuOpen() {
  render(
    <MemoryRouter>
      <Navigation />
    </MemoryRouter>,
  );
  // Open the mobile hamburger menu
  const menuButton = screen.getByLabelText('Mở menu');
  fireEvent.click(menuButton);
}

function renderNavigation() {
  render(
    <MemoryRouter>
      <Navigation />
    </MemoryRouter>,
  );
}

describe('Navigation — Bug Condition Exploration (property-based)', () => {
  /**
   * Property 1: Bug Condition — Mobile Unauthenticated Menu Items Missing Block Display
   *
   * For the deterministic bug condition (user=null, mobile viewport, menu open),
   * both "Đặt Lịch Ngay" and "Đăng nhập" links in the mobile menu should have
   * the `block` class to participate in the parent's space-y-4 block-level flow.
   *
   * This test is EXPECTED TO FAIL on unfixed code, confirming the bug exists.
   *
   * **Validates: Requirements 1.1, 1.2**
   */
  it('mobile unauthenticated menu items should have block display class', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        renderMobileMenuOpen();

        // Find the mobile menu container (md:hidden, visible when open)
        const mobileMenu = document.querySelector('.md\\:hidden.mt-4');

        // Query the "Đặt Lịch Ngay" link within the mobile menu
        const bookNowLink = screen.getAllByText('Đặt Lịch Ngay')
          .find(el => {
            // Find the one inside the mobile menu (not the desktop hidden one)
            let parent = el.parentElement;
            while (parent) {
              if (parent.classList.contains('md:hidden')) return true;
              parent = parent.parentElement;
            }
            return false;
          });

        // Query the "Đăng nhập" link within the mobile menu
        const loginLink = screen.getAllByText('Đăng nhập')
          .find(el => {
            let parent = el.parentElement;
            while (parent) {
              if (parent.classList.contains('md:hidden')) return true;
              parent = parent.parentElement;
            }
            return false;
          });

        expect(bookNowLink).toBeDefined();
        expect(loginLink).toBeDefined();

        // Assert both links have the `block` class for proper vertical stacking
        // On unfixed code, these will FAIL because:
        // - "Đặt Lịch Ngay" has "w-full bg-[#0F6B3E] ... text-center" but no "block"
        // - "Đăng nhập" has "flex items-center gap-2" but no "block"
        expect(bookNowLink!.className).toContain('block');
        expect(loginLink!.className).toContain('block');
      }),
      { numRuns: 1 },
    );
  });
});


describe('Navigation — Preservation (property-based)', () => {
  /**
   * Property 2: Preservation — Desktop and Authenticated Mobile Layouts Unchanged
   *
   * These tests verify that existing correct behavior is preserved BEFORE
   * the fix is applied. They should PASS on both unfixed and fixed code.
   *
   * **Validates: Requirements 3.1, 3.2, 3.3**
   */

  it('desktop unauthenticated links do NOT have block class (horizontal flex layout)', () => {
    fc.assert(
      fc.property(
        fc.oneof(fc.constant('desktop-book-now'), fc.constant('desktop-login')),
        (variant) => {
          renderNavigation();

          // Find the desktop nav container (hidden md:flex)
          const desktopNav = document.querySelector('.hidden.md\\:flex');
          expect(desktopNav).not.toBeNull();

          if (variant === 'desktop-book-now') {
            // Find "Đặt Lịch Ngay" inside the desktop container
            const desktopBookLinks = screen.getAllByText('Đặt Lịch Ngay');
            const desktopBookLink = desktopBookLinks.find((el) => {
              let parent = el.parentElement;
              while (parent) {
                if (
                  parent.classList.contains('hidden') &&
                  parent.classList.contains('md:flex')
                )
                  return true;
                parent = parent.parentElement;
              }
              return false;
            });

            expect(desktopBookLink).toBeDefined();
            // Desktop "Đặt Lịch Ngay" must NOT have `block` — it's in a flex row
            expect(desktopBookLink!.className).not.toContain('block');
          }

          if (variant === 'desktop-login') {
            // Find "Đăng nhập" inside the desktop container
            const desktopLoginLinks = screen.getAllByText('Đăng nhập');
            const desktopLoginLink = desktopLoginLinks.find((el) => {
              let parent = el.parentElement;
              while (parent) {
                if (
                  parent.classList.contains('hidden') &&
                  parent.classList.contains('md:flex')
                )
                  return true;
                parent = parent.parentElement;
              }
              return false;
            });

            expect(desktopLoginLink).toBeDefined();
            // Desktop "Đăng nhập" retains flex items-center for horizontal icon layout
            expect(desktopLoginLink!.className).toContain('flex');
            expect(desktopLoginLink!.className).toContain('items-center');
          }
        },
      ),
      { numRuns: 5 },
    );
  });

  it('mobile section links retain block class for vertical stacking', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.constant('Về Chúng Tôi'),
          fc.constant('Dịch Vụ'),
          fc.constant('Huấn Luyện Viên'),
        ),
        (linkText) => {
          renderMobileMenuOpen();

          // Find the section link inside the mobile menu (md:hidden container)
          const allLinks = screen.getAllByText(linkText);
          const mobileLink = allLinks.find((el) => {
            let parent = el.parentElement;
            while (parent) {
              if (parent.classList.contains('md:hidden')) return true;
              parent = parent.parentElement;
            }
            return false;
          });

          expect(mobileLink).toBeDefined();
          // Section links must have `block` class for proper vertical flow
          expect(mobileLink!.className).toContain('block');
        },
      ),
      { numRuns: 5 },
    );
  });
});
