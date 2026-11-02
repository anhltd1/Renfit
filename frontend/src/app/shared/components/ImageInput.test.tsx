import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ImageInput } from './ImageInput';

describe('ImageInput', () => {
  it('renders URL input with placeholder "Dán URL ảnh"', () => {
    render(<ImageInput value="" onChange={() => {}} />);
    expect(screen.getByPlaceholderText('Dán URL ảnh')).toBeInTheDocument();
  });

  it('typing a URL fires onChange with the typed value', () => {
    const onChange = vi.fn();
    render(<ImageInput value="" onChange={onChange} />);
    const input = screen.getByPlaceholderText('Dán URL ảnh');
    fireEvent.change(input, { target: { value: 'https://example.com/img.png' } });
    expect(onChange).toHaveBeenCalledWith('https://example.com/img.png');
  });

  it('shows thumbnail preview when value is non-empty', () => {
    render(<ImageInput value="https://example.com/img.png" onChange={() => {}} />);
    const img = screen.getByAltText('Preview');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://example.com/img.png');
  });

  it('"Xoá ảnh" button fires onChange with ""', () => {
    const onChange = vi.fn();
    render(<ImageInput value="https://example.com/img.png" onChange={onChange} />);
    const clearBtn = screen.getByText('Xoá ảnh');
    fireEvent.click(clearBtn);
    expect(onChange).toHaveBeenCalledWith('');
  });

  it('no thumbnail when value is empty', () => {
    render(<ImageInput value="" onChange={() => {}} />);
    expect(screen.queryByAltText('Preview')).not.toBeInTheDocument();
  });
});
