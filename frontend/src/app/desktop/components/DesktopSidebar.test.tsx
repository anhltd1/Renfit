import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { DesktopSidebar } from './DesktopSidebar';

const user = {
  id: 'Nguyen Van A',
  phone_number: '0900000000',
  goal: '',
  health_note: '',
  address: '',
  height: '',
  weight: '',
  avatar: '',
  age: 25,
};

function renderSidebar(overrides: Partial<Parameters<typeof DesktopSidebar>[0]> = {}) {
  const onTabChange = vi.fn();
  const onNewChat = vi.fn();
  const onLogout = vi.fn();
  render(
    <MemoryRouter>
      <DesktopSidebar
        user={user}
        activeTab="overview"
        onTabChange={onTabChange}
        onNewChat={onNewChat}
        onLogout={onLogout}
        {...overrides}
      />
    </MemoryRouter>,
  );
  return { onTabChange, onNewChat, onLogout };
}

describe('DesktopSidebar', () => {
  it('renders the user identity and all nav items', () => {
    renderSidebar();
    expect(screen.getByText('Nguyen Van A')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar-nav-overview')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar-nav-chat')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar-nav-bookings')).toBeInTheDocument();
  });

  it('calls onTabChange when a nav item is clicked', () => {
    const { onTabChange } = renderSidebar();
    fireEvent.click(screen.getByTestId('sidebar-nav-chat'));
    expect(onTabChange).toHaveBeenCalledWith('chat');
  });

  it('shows the new-chat button only on the chat tab', () => {
    renderSidebar({ activeTab: 'overview' });
    expect(screen.queryByTestId('sidebar-new-chat')).toBeNull();
  });

  it('calls onLogout when the logout button is clicked', () => {
    const { onLogout } = renderSidebar();
    fireEvent.click(screen.getByTestId('sidebar-logout'));
    expect(onLogout).toHaveBeenCalledOnce();
  });
});
