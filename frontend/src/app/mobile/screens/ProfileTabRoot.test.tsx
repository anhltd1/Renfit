import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProfileTabRoot } from './ProfileTabRoot';

describe('ProfileTabRoot', () => {
  it('renders both entry cards', () => {
    render(<ProfileTabRoot onOpenProfile={vi.fn()} onOpenProgress={vi.fn()} onLogout={vi.fn()} />);
    expect(screen.getByText('Hồ sơ cá nhân')).toBeInTheDocument();
    expect(screen.getByText('Chỉ số InBody')).toBeInTheDocument();
  });

  it('calls onOpenProfile when the profile entry is tapped', () => {
    const onOpenProfile = vi.fn();
    render(<ProfileTabRoot onOpenProfile={onOpenProfile} onOpenProgress={vi.fn()} onLogout={vi.fn()} />);
    fireEvent.click(screen.getByTestId('profile-tab-root-profile-entry'));
    expect(onOpenProfile).toHaveBeenCalledOnce();
  });

  it('calls onOpenProgress when the InBody entry is tapped', () => {
    const onOpenProgress = vi.fn();
    render(<ProfileTabRoot onOpenProfile={vi.fn()} onOpenProgress={onOpenProgress} onLogout={vi.fn()} />);
    fireEvent.click(screen.getByTestId('profile-tab-root-progress-entry'));
    expect(onOpenProgress).toHaveBeenCalledOnce();
  });

  it('calls onLogout when the logout button is tapped', () => {
    const onLogout = vi.fn();
    render(<ProfileTabRoot onOpenProfile={vi.fn()} onOpenProgress={vi.fn()} onLogout={onLogout} />);
    fireEvent.click(screen.getByTestId('profile-tab-root-logout'));
    expect(onLogout).toHaveBeenCalledOnce();
  });
});
