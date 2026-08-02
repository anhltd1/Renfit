import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { UserDashboardPage } from './UserDashboardPage';

// UserDashboardPage is a thin wrapper over MobileShell (which has its own
// dedicated test suite) — stub it here to keep this a focused composition test.
vi.mock('../shell/MobileShell', () => ({
  MobileShell: () => <div data-testid="mobile-shell-stub" />,
}));

describe('Mobile UserDashboardPage', () => {
  it('renders MobileShell', () => {
    render(
      <MemoryRouter>
        <UserDashboardPage />
      </MemoryRouter>,
    );
    expect(screen.getByTestId('mobile-shell-stub')).toBeInTheDocument();
  });
});
