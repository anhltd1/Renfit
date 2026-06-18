import React, { useRef } from 'react';
import { Camera, User } from 'lucide-react';
import { compressImageToBase64 } from '../../lib/api/profile';

interface AvatarUploadProps {
  value: string;          // base64 data URL or empty string
  onChange: (b64: string) => void;
  size?: number;          // px — default 96
  disabled?: boolean;
}

export function AvatarUpload({ value, onChange, size = 96, disabled }: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const b64 = await compressImageToBase64(file, 256);
      onChange(b64);
    } catch {
      // ignore compression errors
    }
    // reset input so the same file can be re-selected
    e.target.value = '';
  };

  return (
    <div className="relative inline-block" style={{ width: size, height: size }}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        className="w-full h-full rounded-full overflow-hidden border-2 border-white/10 hover:border-[#0F6B3E] transition-all duration-300 group focus:outline-none focus:border-[#0F6B3E]"
        style={{ width: size, height: size }}
        title="Chọn ảnh đại diện"
      >
        {value ? (
          <img
            src={value}
            alt="Avatar"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-white/5 flex items-center justify-center">
            <User className="text-white/30" style={{ width: size * 0.4, height: size * 0.4 }} />
          </div>
        )}

        {/* overlay on hover */}
        <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 pointer-events-none">
          <Camera className="text-white" style={{ width: size * 0.28, height: size * 0.28 }} />
          <span className="text-white text-[10px] font-medium">Thay ảnh</span>
        </div>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
        disabled={disabled}
      />
    </div>
  );
}
