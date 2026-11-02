/**
 * Multi-photo picker for the trainer's "Nhập chỉ số InBody" form.
 * Photos are compressed client-side to JPEG data-URLs (same pipeline as
 * avatars, larger size so they hold up in the fullscreen viewer). The first
 * photo is the cover shown on the member's progress screen.
 */
import { useRef, useState } from 'react';
import { ImagePlus, Loader2, Star, X } from 'lucide-react';
import { cn } from '../primitives/cn';
import { compressImageToBase64 } from '../../../lib/api/profile';

export const MAX_INBODY_PHOTOS = 6;
/** Longest edge in px after compression. */
const PHOTO_MAX_SIZE = 1280;

export interface InbodyPhotoPickerProps {
  value: string[];
  onChange: (photos: string[]) => void;
  disabled?: boolean;
}

export function InbodyPhotoPicker({ value, onChange, disabled }: InbodyPhotoPickerProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const remaining = MAX_INBODY_PHOTOS - value.length;

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = '';
    if (files.length === 0) return;
    setError('');
    const accepted = files.slice(0, Math.max(remaining, 0));
    if (files.length > accepted.length) {
      setError(`Tối đa ${MAX_INBODY_PHOTOS} ảnh cho mỗi lần đo.`);
    }
    if (accepted.length === 0) return;
    setBusy(true);
    try {
      const compressed = await Promise.all(accepted.map((f) => compressImageToBase64(f, PHOTO_MAX_SIZE)));
      onChange([...value, ...compressed]);
    } catch {
      setError('Không đọc được ảnh. Vui lòng thử ảnh khác.');
    } finally {
      setBusy(false);
    }
  };

  const remove = (idx: number) => onChange(value.filter((_, i) => i !== idx));
  const makeCover = (idx: number) => onChange([value[idx], ...value.filter((_, i) => i !== idx)]);

  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <label className="text-white/50 text-xs block leading-relaxed">
          Ảnh buổi đo <span className="text-white/25">(không bắt buộc)</span>
        </label>
        <span className="text-white/40 text-xs leading-relaxed">
          {value.length}/{MAX_INBODY_PHOTOS}
        </span>
      </div>

      <div className="grid grid-cols-4 gap-2" data-testid="photo-picker-grid">
        {value.map((src, idx) => (
          <div key={`${idx}-${src.length}`} className="relative aspect-square rounded-xl overflow-hidden border border-white/10 bg-white/5">
            <img src={src} alt={`Ảnh ${idx + 1}`} className="w-full h-full object-cover" />
            {idx === 0 ? (
              <span className="absolute bottom-1 left-1 rounded-full bg-[#0F6B3E] px-1.5 text-white text-[11px] font-semibold leading-relaxed">
                Ảnh bìa
              </span>
            ) : (
              <button
                type="button"
                onClick={() => makeCover(idx)}
                disabled={disabled}
                aria-label={`Đặt ảnh ${idx + 1} làm ảnh bìa`}
                data-testid="photo-picker-cover"
                className="absolute bottom-1 left-1 w-7 h-7 rounded-full bg-black/70 flex items-center justify-center text-white/80 hover:text-white"
              >
                <Star className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={() => remove(idx)}
              disabled={disabled}
              aria-label={`Xoá ảnh ${idx + 1}`}
              data-testid="photo-picker-remove"
              className="absolute top-1 right-1 w-7 h-7 rounded-full bg-black/70 flex items-center justify-center text-white/80 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}

        {remaining > 0 && (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={disabled || busy}
            data-testid="photo-picker-add"
            className={cn(
              'aspect-square rounded-xl border border-dashed border-white/20 flex flex-col items-center justify-center gap-1',
              'text-white/50 hover:text-[#0F6B3E] hover:border-[#0F6B3E]/50 transition-colors active:scale-[0.97]',
              'disabled:opacity-60',
            )}
          >
            {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImagePlus className="w-5 h-5" />}
            <span className="text-[11px] leading-relaxed">{busy ? 'Đang xử lý' : 'Thêm ảnh'}</span>
          </button>
        )}
      </div>

      {error && <p className="text-red-400 text-xs mt-1.5 leading-relaxed">{error}</p>}

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={handleFiles}
        data-testid="photo-picker-input"
      />
    </div>
  );
}
