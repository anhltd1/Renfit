import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { IconPicker } from './IconPicker';

describe('IconPicker', () => {
  it('shows "Không có icon" text when value is empty', () => {
    render(<IconPicker value="" onChange={() => {}} />);
    expect(screen.getByText('Không có icon')).toBeInTheDocument();
  });

  it('shows the selected icon Vietnamese label when a valid icon is set', () => {
    render(<IconPicker value="Dumbbell" onChange={() => {}} />);
    expect(screen.getByText('Tạ')).toBeInTheDocument();
  });

  it('clicking the trigger opens the dropdown (shows icon grid)', () => {
    render(<IconPicker value="" onChange={() => {}} />);
    const trigger = screen.getByRole('button');
    fireEvent.click(trigger);
    // The dropdown shows at least some icon labels (the grid of 24 icons)
    expect(screen.getByText('Lửa')).toBeInTheDocument();
    expect(screen.getByText('Tim')).toBeInTheDocument();
  });

  it('clicking an icon in the dropdown fires onChange with the icon name', () => {
    const onChange = vi.fn();
    render(<IconPicker value="" onChange={onChange} />);
    // Open dropdown
    fireEvent.click(screen.getByRole('button'));
    // Click "Lửa" (Flame icon)
    fireEvent.click(screen.getByTitle('Lửa'));
    expect(onChange).toHaveBeenCalledWith('Flame');
  });

  it('"Không có icon" option in dropdown fires onChange with ""', () => {
    const onChange = vi.fn();
    render(<IconPicker value="Dumbbell" onChange={onChange} />);
    // Open dropdown
    fireEvent.click(screen.getByText('Tạ'));
    // Click the "Không có icon" option inside the dropdown
    const noIconOptions = screen.getAllByText('Không có icon');
    // The dropdown option (not the trigger text since value is set)
    fireEvent.click(noIconOptions[0]);
    expect(onChange).toHaveBeenCalledWith('');
  });
});
