import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as profileApi from '../../../lib/api/profile';
import { InbodyPhotoPicker, MAX_INBODY_PHOTOS } from './InbodyPhotoPicker';

vi.mock('../../../lib/api/profile', async () => {
  const actual = await vi.importActual<typeof profileApi>('../../../lib/api/profile');
  return { ...actual, compressImageToBase64: vi.fn() };
});

const file = (name: string) => new File(['x'], name, { type: 'image/jpeg' });

describe('InbodyPhotoPicker', () => {
  beforeEach(() => {
    vi.mocked(profileApi.compressImageToBase64).mockImplementation(async (f: File) => `data:image/jpeg;base64,${f.name}`);
  });

  it('compresses selected files and appends them', async () => {
    const onChange = vi.fn();
    render(<InbodyPhotoPicker value={['data:existing']} onChange={onChange} />);
    fireEvent.change(screen.getByTestId('photo-picker-input'), { target: { files: [file('a'), file('b')] } });
    await waitFor(() =>
      expect(onChange).toHaveBeenCalledWith(['data:existing', 'data:image/jpeg;base64,a', 'data:image/jpeg;base64,b']),
    );
    expect(profileApi.compressImageToBase64).toHaveBeenCalledWith(expect.any(File), 1280);
  });

  it('caps the total at the max and explains why', async () => {
    const onChange = vi.fn();
    const existing = Array.from({ length: MAX_INBODY_PHOTOS - 1 }, (_, i) => `data:${i}`);
    render(<InbodyPhotoPicker value={existing} onChange={onChange} />);
    fireEvent.change(screen.getByTestId('photo-picker-input'), { target: { files: [file('a'), file('b')] } });
    await waitFor(() => expect(onChange).toHaveBeenCalledWith([...existing, 'data:image/jpeg;base64,a']));
    expect(screen.getByText(`Tối đa ${MAX_INBODY_PHOTOS} ảnh cho mỗi lần đo.`)).toBeInTheDocument();
  });

  it('hides the add tile when full', () => {
    const full = Array.from({ length: MAX_INBODY_PHOTOS }, (_, i) => `data:${i}`);
    render(<InbodyPhotoPicker value={full} onChange={vi.fn()} />);
    expect(screen.queryByTestId('photo-picker-add')).not.toBeInTheDocument();
  });

  it('removes a photo and promotes another to cover', () => {
    const onChange = vi.fn();
    render(<InbodyPhotoPicker value={['data:1', 'data:2', 'data:3']} onChange={onChange} />);
    expect(screen.getByText('Ảnh bìa')).toBeInTheDocument();

    fireEvent.click(screen.getAllByTestId('photo-picker-remove')[1]);
    expect(onChange).toHaveBeenLastCalledWith(['data:1', 'data:3']);

    // Cover buttons exist only for non-cover photos, so [1] is photo #3.
    fireEvent.click(screen.getAllByTestId('photo-picker-cover')[1]);
    expect(onChange).toHaveBeenLastCalledWith(['data:3', 'data:1', 'data:2']);
  });
});
