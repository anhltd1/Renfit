import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { User } from 'lucide-react';
import { DetailField } from './DetailField';

describe('DetailField', () => {
  it('renders the icon, label, and value', () => {
    render(<DetailField icon={<User data-testid="field-icon" />} label="Tuổi" value="25 tuổi" />);
    expect(screen.getByText('Tuổi')).toBeInTheDocument();
    expect(screen.getByText('25 tuổi')).toBeInTheDocument();
    expect(screen.getByTestId('field-icon')).toBeInTheDocument();
  });

  it('renders numeric values', () => {
    render(<DetailField icon={<User />} label="Số lần" value={5} />);
    expect(screen.getByText('5')).toBeInTheDocument();
  });
});
