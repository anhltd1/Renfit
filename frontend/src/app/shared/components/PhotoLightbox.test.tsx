import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PhotoLightbox } from './PhotoLightbox';

const PHOTOS = ['/p/1.jpg', '/p/2.jpg', '/p/3.jpg'];

describe('PhotoLightbox', () => {
  it('renders nothing when closed', () => {
    render(<PhotoLightbox open={false} photos={PHOTOS} onClose={vi.fn()} />);
    expect(screen.queryByTestId('lightbox-overlay')).not.toBeInTheDocument();
  });

  it('opens at the requested photo with a counter and every thumbnail', () => {
    render(<PhotoLightbox open photos={PHOTOS} initialIndex={1} title="Ngày đo 01/10/2026" onClose={vi.fn()} />);
    expect(screen.getByRole('dialog', { name: 'Ngày đo 01/10/2026' })).toBeInTheDocument();
    expect(screen.getByTestId('lightbox-image')).toHaveAttribute('src', '/p/2.jpg');
    expect(screen.getByTestId('lightbox-counter')).toHaveTextContent('2 / 3');
    expect(screen.getAllByTestId('lightbox-thumb')).toHaveLength(3);
  });

  it('navigates with buttons, wraps around, and jumps via thumbnails', () => {
    render(<PhotoLightbox open photos={PHOTOS} onClose={vi.fn()} />);
    const img = () => screen.getByTestId('lightbox-image');

    fireEvent.click(screen.getByTestId('lightbox-next'));
    expect(img()).toHaveAttribute('src', '/p/2.jpg');

    fireEvent.click(screen.getByTestId('lightbox-prev'));
    fireEvent.click(screen.getByTestId('lightbox-prev'));
    expect(img()).toHaveAttribute('src', '/p/3.jpg'); // wrapped

    fireEvent.click(screen.getAllByTestId('lightbox-thumb')[0]);
    expect(img()).toHaveAttribute('src', '/p/1.jpg');
  });

  it('supports arrow keys and closes on Escape', () => {
    const onClose = vi.fn();
    render(<PhotoLightbox open photos={PHOTOS} onClose={onClose} />);
    fireEvent.keyDown(window, { key: 'ArrowRight' });
    expect(screen.getByTestId('lightbox-image')).toHaveAttribute('src', '/p/2.jpg');
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('swipes left to go to the next photo', () => {
    render(<PhotoLightbox open photos={PHOTOS} onClose={vi.fn()} />);
    const stage = screen.getByTestId('lightbox-image').parentElement!;
    fireEvent.touchStart(stage, { touches: [{ clientX: 300 }] });
    fireEvent.touchEnd(stage, { changedTouches: [{ clientX: 150 }] });
    expect(screen.getByTestId('lightbox-image')).toHaveAttribute('src', '/p/2.jpg');
  });

  it('hides navigation for a single photo and closes via the close button', () => {
    const onClose = vi.fn();
    render(<PhotoLightbox open photos={['/only.jpg']} onClose={onClose} />);
    expect(screen.queryByTestId('lightbox-next')).not.toBeInTheDocument();
    expect(screen.queryByTestId('lightbox-counter')).not.toBeInTheDocument();
    fireEvent.click(screen.getByTestId('lightbox-close'));
    expect(onClose).toHaveBeenCalled();
  });

  it('locks body scroll while open and restores it on close', () => {
    const { rerender } = render(<PhotoLightbox open photos={PHOTOS} onClose={vi.fn()} />);
    expect(document.body.style.overflow).toBe('hidden');
    rerender(<PhotoLightbox open={false} photos={PHOTOS} onClose={vi.fn()} />);
    expect(document.body.style.overflow).toBe('');
  });
});
