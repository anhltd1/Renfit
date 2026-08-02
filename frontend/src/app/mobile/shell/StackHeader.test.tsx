import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StackHeader } from './StackHeader';

describe('StackHeader', () => {
  it('renders the title', () => {
    render(<StackHeader title="Hồ sơ cá nhân" />);
    expect(screen.getByText('Hồ sơ cá nhân')).toBeInTheDocument();
  });

  it('omits the back button when onBack is not provided', () => {
    render(<StackHeader title="Tổng quan" />);
    expect(screen.queryByTestId('stack-header-back')).toBeNull();
  });

  it('shows the back button and calls onBack when clicked', () => {
    const onBack = vi.fn();
    render(<StackHeader title="Chi tiết" onBack={onBack} />);
    fireEvent.click(screen.getByTestId('stack-header-back'));
    expect(onBack).toHaveBeenCalledOnce();
  });

  it('renders the right slot content', () => {
    render(<StackHeader title="Tổng quan" right={<span>Bell</span>} />);
    expect(screen.getByText('Bell')).toBeInTheDocument();
  });
});
