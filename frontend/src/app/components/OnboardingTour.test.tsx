import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { OnboardingTour, type OnboardingStep } from './OnboardingTour';

describe('OnboardingTour (default desktop behavior — regression guard)', () => {
  it('renders the default welcome step when no steps prop is passed', () => {
    render(<OnboardingTour onTabChange={vi.fn()} onFinish={vi.fn()} />);
    expect(screen.getByText(/Chào mừng đến với Renfit/)).toBeInTheDocument();
  });

  it('Skip calls onFinish', () => {
    const onFinish = vi.fn();
    render(<OnboardingTour onTabChange={vi.fn()} onFinish={onFinish} />);
    fireEvent.click(screen.getByText('Bỏ qua'));
    expect(onFinish).toHaveBeenCalledOnce();
  });
});

describe('OnboardingTour (custom steps — generalization for mobile)', () => {
  it('renders a custom step sequence when steps is provided', () => {
    const steps: OnboardingStep<'a' | 'b'>[] = [
      { title: 'Bước tuỳ chỉnh 1', description: 'Nội dung tuỳ chỉnh' },
    ];
    render(<OnboardingTour steps={steps} onTabChange={vi.fn()} onFinish={vi.fn()} />);
    expect(screen.getByText('Bước tuỳ chỉnh 1')).toBeInTheDocument();
    expect(screen.getByText('Nội dung tuỳ chỉnh')).toBeInTheDocument();
  });

  it('calls onTabChange with the custom tab type when a step specifies one', () => {
    const onTabChange = vi.fn();
    const steps: OnboardingStep<'x'>[] = [
      { target: 'mobile-tab-x', tab: 'x', title: 'Bước X', description: 'desc' },
    ];
    render(<OnboardingTour steps={steps} onTabChange={onTabChange} onFinish={vi.fn()} />);
    expect(onTabChange).toHaveBeenCalledWith('x');
  });
});
