import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useRef } from 'react';
import { useFocusTrap } from './useFocusTrap';

function TestDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(open, ref);
  if (!open) return null;
  return (
    <div ref={ref} data-testid="dialog" tabIndex={-1}>
      <button type="button" data-testid="first">First</button>
      <button type="button" data-testid="last">Last</button>
      <button type="button" onClick={onClose} data-testid="close">
        Close
      </button>
    </div>
  );
}

describe('useFocusTrap', () => {
  it('moves focus into the dialog on open', () => {
    render(
      <div>
        <button type="button" data-testid="trigger">Open</button>
        <TestDialog open onClose={() => {}} />
      </div>,
    );
    expect(document.activeElement).toBe(screen.getByTestId('first'));
  });

  it('traps Tab within the dialog (wraps from last to first)', () => {
    render(
      <div>
        <button type="button" data-testid="outside">Outside</button>
        <TestDialog open onClose={() => {}} />
      </div>,
    );
    screen.getByTestId('close').focus();
    fireEvent.keyDown(document, { key: 'Tab' });
    expect(document.activeElement).toBe(screen.getByTestId('first'));
  });

  it('traps Shift+Tab within the dialog (wraps from first to last)', () => {
    render(
      <div>
        <button type="button" data-testid="outside">Outside</button>
        <TestDialog open onClose={() => {}} />
      </div>,
    );
    screen.getByTestId('first').focus();
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(screen.getByTestId('close'));
  });

  it('returns focus to the trigger element when the dialog closes', () => {
    const trigger = document.createElement('button');
    trigger.setAttribute('data-testid', 'real-trigger');
    document.body.appendChild(trigger);
    trigger.focus();

    const { rerender } = render(<TestDialog open onClose={() => {}} />);
    expect(document.activeElement).not.toBe(trigger);

    rerender(<></>);
    expect(document.activeElement).toBe(trigger);

    document.body.removeChild(trigger);
  });
});
