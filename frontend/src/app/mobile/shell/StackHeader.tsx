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
    // `app-chrome`: a drag that starts on the header must not pan/bounce anything.
    <header
      className="app-chrome shrink-0 relative z-10 bg-black/80 backdrop-blur-md border-b border-white/10 px-4 py-2 min-h-14 flex items-center gap-2"
      style={{ paddingTop: 'max(0.5rem, env(safe-area-inset-top))' }}
    >
      {onBack && (
        <button
          type="button"
          data-testid="stack-header-back"
          onClick={onBack}
          aria-label="Quay lại"
          className="w-11 h-11 -ml-2 shrink-0 rounded-xl text-white/70 hover:text-white hover:bg-white/5 flex items-center justify-center transition-[color,background-color,transform] duration-[var(--motion-fast)] active:scale-[0.92]"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}
      <h1 className="text-white font-bold truncate flex-1 min-w-0 leading-relaxed">{title}</h1>
      {right && <div className="shrink-0">{right}</div>}
    </header>
  );
}
