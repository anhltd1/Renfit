import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { CapacityMarks, capacityLabel, PLACES_PER_SLOT } from './CapacityMarks';

describe('CapacityMarks (example-based)', () => {
  it('draws one mark per place and fills the taken ones', () => {
    const { container } = render(<CapacityMarks taken={2} />);
    const marks = container.querySelectorAll('[aria-hidden="true"] > span');
    expect(marks).toHaveLength(4);
    expect(Array.from(marks).filter((m) => m.className.includes('bg-primary'))).toHaveLength(2);
  });

  it('shows the fraction label', () => {
    render(<CapacityMarks taken={3} showLabel />);
    expect(screen.getByText('3/4')).toBeInTheDocument();
  });

  it('says "Hết chỗ" for a full slot in remaining style', () => {
    render(<CapacityMarks taken={4} showLabel labelStyle="remaining" />);
    expect(screen.getByText('Hết chỗ')).toBeInTheDocument();
  });

  it("marks the viewer's own place in the text green", () => {
    const { container } = render(<CapacityMarks taken={2} mine />);
    expect(container.querySelectorAll('.bg-primary-text')).toHaveLength(1);
  });
});

describe('capacityLabel (property-based, invariant)', () => {
  const slotArb = fc.record({
    taken: fc.integer({ min: -2, max: PLACES_PER_SLOT + 3 }),
    capacity: fc.constant(PLACES_PER_SLOT),
  });

  it('clamps taken into [0, capacity] and remaining + taken = capacity', () => {
    fc.assert(
      fc.property(slotArb, ({ taken, capacity }) => {
        const [t, c] = capacityLabel(taken, capacity, 'fraction').split('/').map(Number);
        expect(c).toBe(capacity);
        expect(t).toBeGreaterThanOrEqual(0);
        expect(t).toBeLessThanOrEqual(capacity);
        const remaining = capacityLabel(taken, capacity, 'remaining');
        const free = remaining === 'Hết chỗ' ? 0 : Number(/Còn (\d+) chỗ/.exec(remaining)![1]);
        expect(free + t).toBe(capacity);
      }),
    );
  });
});
