import logoImage from '../../../imports/image.png';
import { cn } from '../primitives/cn';

/**
 * Renfit mark + wordmark (DESIGN.md v2: the product is named at the top of
 * every shell). `scope` names where the viewer is ("Hội viên", "Huấn luyện viên").
 */
export interface BrandMarkProps {
  scope?: string;
  size?: 'sm' | 'md';
  className?: string;
}

export function BrandMark({ scope, size = 'md', className }: BrandMarkProps) {
  return (
    <span className={cn('inline-flex items-center gap-2.5 min-w-0', className)}>
      <img
        src={logoImage}
        alt=""
        aria-hidden="true"
        className={cn('w-auto shrink-0', size === 'sm' ? 'h-6' : 'h-8')}
      />
      <span className="min-w-0 leading-tight">
        <span className={cn('block text-white font-bold', size === 'sm' ? 'text-base' : 'text-lg')}>Renfit</span>
        {scope && <span className="block text-white/64 text-xs truncate">{scope}</span>}
      </span>
    </span>
  );
}
