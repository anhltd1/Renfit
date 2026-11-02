import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { InbodyPhotoTick } from './InbodyPhotoTick';

const LABELS = ['01/08/26', '27/10/26', ''];
const PHOTOS = [undefined, ['/api/v1/inbody/photos/a', '/api/v1/inbody/photos/b', '/api/v1/inbody/photos/c'], undefined];

function renderTick(index: number, onOpen = vi.fn()) {
  render(
    <svg>
      <InbodyPhotoTick x={100} y={10} index={index} labels={LABELS} photos={PHOTOS} onOpen={onOpen} />
    </svg>,
  );
  return onOpen;
}

describe('InbodyPhotoTick', () => {
  it('shows the date and the cover thumbnail with a +N badge under it', () => {
    renderTick(1);
    expect(screen.getByText('27/10/26')).toBeInTheDocument();
    const thumb = screen.getByTestId('inbody-photo-thumb');
    expect(thumb.querySelector('img')).toHaveAttribute('src', '/api/v1/inbody/photos/a');
    expect(thumb).toHaveTextContent('+2');
    expect(thumb).toHaveAccessibleName('Xem 3 ảnh ngày 27/10/26');
  });

  it('opens the photos for its own column', () => {
    const onOpen = renderTick(1);
    fireEvent.click(screen.getByTestId('inbody-photo-thumb'));
    expect(onOpen).toHaveBeenCalledWith(1);
  });

  it('shows only the date when that measurement has no photos', () => {
    renderTick(0);
    expect(screen.getByText('01/08/26')).toBeInTheDocument();
    expect(screen.queryByTestId('inbody-photo-thumb')).not.toBeInTheDocument();
  });

  it('renders nothing for padding columns', () => {
    const { container } = render(
      <svg>
        <InbodyPhotoTick x={0} y={0} index={2} labels={LABELS} photos={PHOTOS} onOpen={vi.fn()} />
      </svg>,
    );
    expect(container.querySelector('text')).toBeNull();
    expect(screen.queryByTestId('inbody-photo-thumb')).not.toBeInTheDocument();
  });
});
