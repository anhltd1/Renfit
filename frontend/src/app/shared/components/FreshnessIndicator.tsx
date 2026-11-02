import { WifiOff } from 'lucide-react';
import { cn } from '../primitives/cn';

export function formatIctHm(d: Date): string {
  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Ho_Chi_Minh',
  }).format(d);
}

export interface FreshnessIndicatorProps {
  lastUpdatedAt: Date | null;
  offline: boolean;
  className?: string;
}

export function FreshnessIndicator({ lastUpdatedAt, offline, className }: FreshnessIndicatorProps) {
  if (offline) {
    return (
      <span
        data-testid="freshness-offline"
        aria-live="off"
        className={cn('inline-flex items-center gap-1 text-xs leading-relaxed text-error-text', className)}
      >
        <WifiOff className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        Mất kết nối — đang thử lại
      </span>
    );
  }
  if (!lastUpdatedAt) return null;
  return (
    <span
      data-testid="freshness-updated"
      aria-live="off"
      className={cn('text-xs leading-relaxed text-white/60 tabular-nums', className)}
    >
      Cập nhật {formatIctHm(lastUpdatedAt)}
    </span>
  );
}
