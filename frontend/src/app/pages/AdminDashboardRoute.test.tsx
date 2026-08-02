import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { DeviceProvider } from '../device/DeviceProvider';
import { AdminDashboardRoute } from './AdminDashboardRoute';

// Stub both page trees rather than mounting the full dashboards (same
// mock-page-module pattern as DashboardRoute.test.tsx — isolates the route's
// pure device-based selection and avoids any early-redirect-on-render loop).
vi.mock('../desktop/pages/AdminDashboardPage', () => ({
  AdminDashboardPage: () => <div data-testid="desktop-admin-dashboard-stub" />,
}));
vi.mock('../mobile/pages/AdminDashboardPage', () => ({
  AdminDashboardPage: () => <div data-testid="mobile-admin-dashboard-stub" />,
}));

function renderWithDevice(device: 'desktop' | 'mobile') {
  return render(
    <MemoryRouter>
      <DeviceProvider forceDevice={device}>
        <AdminDashboardRoute />
      </DeviceProvider>
    </MemoryRouter>,
  );
}

describe('AdminDashboardRoute', () => {
  it('renders the desktop admin dashboard on desktop', () => {
    renderWithDevice('desktop');
    expect(screen.getByTestId('desktop-admin-dashboard-stub')).toBeInTheDocument();
    expect(screen.queryByTestId('mobile-admin-dashboard-stub')).toBeNull();
  });

  it('renders the mobile admin dashboard on mobile', () => {
    renderWithDevice('mobile');
    expect(screen.getByTestId('mobile-admin-dashboard-stub')).toBeInTheDocument();
    expect(screen.queryByTestId('desktop-admin-dashboard-stub')).toBeNull();
  });
});
