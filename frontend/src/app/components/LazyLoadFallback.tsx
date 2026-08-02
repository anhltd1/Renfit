/**
 * Shared Suspense fallback for route-level code-splitting (U7 Performance &
 * PWA, SPLIT-1). Minimal centered spinner using existing design tokens —
 * shown only for the brief window while a lazy route chunk downloads.
 */
import { Loader2 } from 'lucide-react';

export function LazyLoadFallback() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Đang tải..."
      className="min-h-screen w-full flex items-center justify-center bg-[#0B0B0B]"
    >
      <Loader2 className="w-8 h-8 text-[#0F6B3E] animate-spin" />
    </div>
  );
}
