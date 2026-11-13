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

  it('renders a flat surface panel when tier is omitted (DESIGN.md v2)', () => {
    const { container } = render(<Card>Default</Card>);
    const card = container.firstElementChild as HTMLElement;
    expect(card.className).toContain('bg-surface');
    expect(card.className).toContain('border-line');
    expect(card.className).toContain('rounded-panel');
  });

  it('never uses glass, glow or hover scale on any tier', () => {
    for (const tier of GLASS_TIERS) {
      const { container } = render(<Card tier={tier} hoverable>T</Card>);
      const cls = (container.firstElementChild as HTMLElement).className;
      expect(cls).not.toContain('backdrop-blur');
      expect(cls).not.toContain('hover:scale');
      expect(cls).not.toContain('shadow-[0_0_');
      expect(cls).not.toContain('bg-gradient');
    }
  });

  it('renders the elevated tier as a floating overlay surface', () => {
    const { container } = render(<Card tier="elevated">Elevated</Card>);
    const card = container.firstElementChild as HTMLElement;
    expect(card.className).toContain('bg-overlay');
  });
});

describe('Card tier (property-based, invariant)', () => {
  const tierArb = fc.constantFrom(...GLASS_TIERS);

  it('every tier keeps the v2 panel radius and a 1px line border', () => {
    fc.assert(
      fc.property(tierArb, (tier) => {
        const { container } = render(<Card tier={tier}>Test</Card>);
        const cls = (container.firstElementChild as HTMLElement).className;
        expect(cls).toContain('rounded-panel');
        expect(cls).toContain('border-line');
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
