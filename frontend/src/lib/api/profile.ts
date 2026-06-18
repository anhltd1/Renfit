import type { AuthUser } from '../auth';

const API_BASE = import.meta.env.VITE_API_URL ?? '';

export interface UpdateProfilePayload {
  customer_id: string;
  goal?: string;
  health_note?: string;
  address?: string;
  height?: string;
  weight?: string;
  avatar?: string;
  age?: number;
  current_password?: string;
  new_password?: string;
}

export async function updateProfile(payload: UpdateProfilePayload): Promise<AuthUser> {
  const url = API_BASE ? `${API_BASE}/api/v1/profile` : '/api/v1/profile';
  const res = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { detail?: unknown };
    if (Array.isArray(err.detail)) {
      const first = err.detail[0] as { msg?: string; loc?: string[] } | undefined;
      const field = first?.loc?.filter((s) => s !== 'body').join(' → ') ?? '';
      const msg = first?.msg ?? 'Dữ liệu không hợp lệ';
      throw new Error(field ? `${field}: ${msg}` : msg);
    }
    if (typeof err.detail === 'string') throw new Error(err.detail);
    throw new Error('Không thể cập nhật thông tin. Vui lòng thử lại.');
  }

  return res.json();
}

/**
 * Compress and convert an image File to a base64 data-URL
 * resized to maxSize × maxSize px (default 256).
 */
export function compressImageToBase64(file: File, maxSize = 256): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ratio = Math.min(maxSize / img.width, maxSize / img.height, 1);
        canvas.width = Math.round(img.width * ratio);
        canvas.height = Math.round(img.height * ratio);
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };
      img.src = e.target!.result as string;
    };
    reader.readAsDataURL(file);
  });
}
