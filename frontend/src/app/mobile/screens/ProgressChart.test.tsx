import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProgressChart } from './ProgressChart';

describe('ProgressChart', () => {
  it('renders the chart container', () => {
    render(<ProgressChart data={[{ date: '01/01', value: 60 }]} color="#22c55e" />);
    expect(screen.getByTestId('progress-chart')).toBeInTheDocument();
  });
});
