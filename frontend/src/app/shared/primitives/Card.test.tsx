import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { Card, type GlassTier } from './Card';

const GLASS_TIERS: GlassTier[] = ['ambient', 'card', 'elevated'];

describe('Card (example-based)', () => {
  it('renders children', () => {
    render(<Card>Hello</Card>);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('renders with default styling when tier is omitted (backwards compatible)', () => {
    const { container } = render(<Card>Default</Card>);
    const card = container.firstElementChild as HTMLElement;
    expect(card.className).toContain('backdrop-blur-xl');
    expect(card.className).toContain('bg-white/5');
  });

  it('renders ambient tier without backdrop-blur', () => {
    const { container } = render(<Card tier="ambient">Ambient</Card>);
    const card = container.firstElementChild as HTMLElement;
    expect(card.className).not.toContain('backdrop-blur');
    expect(card.className).toContain('from-white/[0.04]');
  });

  it('renders card tier with 12px blur and inner highlight', () => {
    const { container } = render(<Card tier="card">CardTier</Card>);
    const card = container.firstElementChild as HTMLElement;
    expect(card.className).toContain('backdrop-blur-[12px]');
    expect(card.className).toContain('shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]');
  });

  it('renders elevated tier with 20px blur', () => {
    const { container } = render(<Card tier="elevated">Elevated</Card>);
    const card = container.firstElementChild as HTMLElement;
    expect(card.className).toContain('backdrop-blur-[20px]');
  });
});

describe('Card Glass_Tier (property-based, invariant)', () => {
  const tierArb = fc.constantFrom(...GLASS_TIERS);

  it('each tier produces a distinct class-name set from the other two', () => {
    fc.assert(
      fc.property(tierArb, (tier) => {
        const { container } = render(<Card tier={tier}>Test</Card>);
        const card = container.firstElementChild as HTMLElement;
        const classes = card.className;

        // Each tier should have at least one class that differs from the other tiers
        const otherTiers = GLASS_TIERS.filter((t) => t !== tier);
        for (const otherTier of otherTiers) {
          const { container: otherContainer } = render(<Card tier={otherTier}>Other</Card>);
          const otherCard = otherContainer.firstElementChild as HTMLElement;
          expect(classes).not.toBe(otherCard.className);
        }
      }),
    );
  });

  it('renders without error for every tier value', () => {
    fc.assert(
      fc.property(tierArb, (tier) => {
        const { container } = render(<Card tier={tier}>Content</Card>);
        expect(container.firstElementChild).not.toBeNull();
      }),
    );
  });
});
