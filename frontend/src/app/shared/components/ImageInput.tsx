import React, { useRef } from 'react';
import { Upload, X } from 'lucide-react';
import { Button } from '../primitives/Button';
import { cn } from '../primitives/cn';
import { compressImageToBase64 } from '../../../lib/api/profile';

export interface ImageInputProps {
  value: string;
  onChange: (val: string) => void;
  label?: string;
  maxSize?: number;
  disabled?: boolean;
}

export function ImageInput({ value, onChange, label, maxSize = 800, disabled }: ImageInputProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const b64 = await compressImageToBase64(file, maxSize);
      onChange(b64);
    } catch {
      // compression error — ignore
    }
    e.target.value = '';
  };

  return (
    <div className="w-full space-y-2">
      {label && (
        <label className="block text-white/64 text-sm leading-relaxed">{label}</label>
      )}

      {/* URL text input */}
      <input
        type="text"
        placeholder="Dán URL ảnh"
        value={value.startsWith('data:') ? '' : value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={cn(
          'w-full rounded-panel bg-white/5 border border-line text-white',
          'placeholder:text-white/40 py-3 px-4 leading-relaxed outline-none',
          'transition-colors duration-300 focus:border-primary-text',
          'disabled:opacity-60 disabled:cursor-not-allowed',
        )}
      />

      {/* File upload button */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled}
          onClick={() => fileRef.current?.click()}
        >
          <Upload className="w-4 h-4" />
          <span className="leading-relaxed">Hoặc tải lên</span>
        </Button>

        {value && (
          <Button
            variant="ghost"
            size="sm"
            disabled={disabled}
            onClick={() => onChange('')}
          >
            <X className="w-4 h-4" />
            <span className="leading-relaxed">Xoá ảnh</span>
          </Button>
        )}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFile}
        disabled={disabled}
      />

      {/* Thumbnail preview */}
      {value && (
        <div className="mt-2">
          <img
            src={value}
            alt="Preview"
            className="w-24 h-24 object-cover rounded-control border border-line"
          />
        </div>
      )}
    </div>
  );
}
