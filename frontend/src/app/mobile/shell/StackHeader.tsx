/**
 * Native-style stacked-screen header (U4 Trainee Mobile, TS-1).
 * Shows a back chevron only when the current tab's stack can pop (NAV-3).
 */
import type { ReactNode } from 'react';
import { ChevronLeft } from 'lucide-react';

export interface StackHeaderProps {
  title: string;
  /** Omit (or pass undefined) on a tab's root screen. */
  onBack?: () => void;
  /** e.g. the notification bell on the Overview root, or a "new chat" action on Coach. */
  right?: ReactNode;
}

export function StackHeader({ title, onBack, right }: StackHeaderProps) {
  return (
    <header
      className="shrink-0 bg-black/80 backdrop-blur-md border-b border-white/10 px-4 py-3 flex items-center gap-2"
      style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}
    >
      {onBack && (
        <button
          type="button"
          data-testid="stack-header-back"
          onClick={onBack}
          aria-label="Quay lại"
          className="w-9 h-9 -ml-1 shrink-0 rounded-xl text-white/70 hover:text-white hover:bg-white/5 flex items-center justify-center transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      )}
      <h1 className="text-white font-bold truncate flex-1 min-w-0">{title}</h1>
      {right && <div className="shrink-0">{right}</div>}
    </header>
  );
}
