import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { DeviceProvider } from '../device/DeviceProvider';
import { DashboardRoute } from './DashboardRoute';

// Stub both page trees rather than mounting the full dashboards (they have
// their own dedicated tests). This isolates DashboardRoute's job — pure
// device-based selection — and avoids the full pages' `navigate('/login')`
// early-redirect-on-render, which would loop forever here since this test
// renders the route outside a matching <Routes> tree (in the real app the
// route unmounts once the location no longer matches; here it never does).
vi.mock('../desktop/pages/UserDashboardPage', () => ({
  UserDashboardPage: () => <div data-testid="desktop-dashboard-stub" />,
}));
vi.mock('../mobile/pages/UserDashboardPage', () => ({
  UserDashboardPage: () => <div data-testid="mobile-dashboard-stub" />,
}));

function renderWithDevice(device: 'desktop' | 'mobile') {
  return render(
    <MemoryRouter>
      <DeviceProvider forceDevice={device}>
        <DashboardRoute />
      </DeviceProvider>
    </MemoryRouter>,
  );
}

describe('DashboardRoute', () => {
  it('renders the desktop dashboard on desktop', () => {
    renderWithDevice('desktop');
    expect(screen.getByTestId('desktop-dashboard-stub')).toBeInTheDocument();
    expect(screen.queryByTestId('mobile-dashboard-stub')).toBeNull();
  });

  it('renders the mobile dashboard on mobile', () => {
    renderWithDevice('mobile');
    expect(screen.getByTestId('mobile-dashboard-stub')).toBeInTheDocument();
    expect(screen.queryByTestId('desktop-dashboard-stub')).toBeNull();
  });
});
