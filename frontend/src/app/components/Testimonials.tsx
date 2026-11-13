import { ImageWithFallback } from './figma/ImageWithFallback';
import { cn } from '../shared/primitives/cn';
import { useInView } from '../shared/hooks/useInView';
import { buildSrcSet } from '../../lib/utils/buildSrcSet';
import type { TestimonialsContent } from '../../lib/api/siteContent';

interface TestimonialsProps {
  content?: TestimonialsContent;
}

const DEFAULT_TESTIMONIALS: TestimonialsContent = {
  title: 'Khách hàng ở Renfit nói gì',
  subtitle: 'Những chia sẻ thật từ hội viên đang tập luyện cùng Renfit.',
  items: [],
};

/**
 * Landing testimonials (DESIGN.md v2, "portrait and offset quotation").
 * The first member gets a tall portrait with their words offset beside it;
 * the others follow as quieter photo + name + quote rows. Content is
 * CMS-managed (CmsEditor → testimonials); entries without a name or message
 * are skipped.
 */
export function Testimonials({ content }: TestimonialsProps) {
  const { ref, isRevealed } = useInView<HTMLElement>();
  const data = content ?? DEFAULT_TESTIMONIALS;
  const items = data.items.filter((t) => t.name.trim() && t.message.trim());

  if (items.length === 0) return null;

  const photo = (t: (typeof items)[number], large: boolean) => {
    const srcSet = t.image ? buildSrcSet(t.image, [480, 800, 1200]) : undefined;
    return t.image ? (
      <ImageWithFallback
        src={t.image}
        alt={t.name}
        className={cn('w-full object-cover object-top rounded-panel bg-surface', large ? 'aspect-[3/4]' : 'aspect-square')}
        loading="lazy"
        decoding="async"
        width={800}
        height={large ? 1067 : 800}
        srcSet={srcSet}
        sizes={srcSet ? (large ? '(min-width: 1024px) 33vw, 72vw' : '(min-width: 640px) 160px, 96px') : undefined}
      />
    ) : (
      <div
        aria-hidden="true"
        className={cn('w-full rounded-panel bg-surface-2 border border-line flex items-center justify-center', large ? 'aspect-[3/4]' : 'aspect-square')}
      >
        <span className="text-white/64 text-4xl font-semibold">{t.name.trim().charAt(0)}</span>
      </div>
    );
  };

  return (
    <section
      id="testimonials"
      ref={ref}
      aria-labelledby="testimonials-title"
      className="scroll-mt-24 py-16 sm:py-24 px-4 sm:px-6 lg:px-10"
    >
      <div className="max-w-7xl mx-auto">
        <div className={cn('max-w-2xl mb-12 opacity-0 translate-y-2', isRevealed && 'animate-fade-up')}>
          <h2 id="testimonials-title" className="text-white font-bold leading-[1.15] text-[clamp(1.75rem,3.5vw,2.75rem)]">
            {data.title}
          </h2>
          {data.subtitle && <p className="mt-4 text-white/80 text-base sm:text-lg leading-relaxed">{data.subtitle}</p>}
        </div>

        <ul data-testid="testimonials-list" className="space-y-16">
          {items.map((t, index) => {
            const lead = index === 0;
            return (
              <li
                key={`${t.name}-${index}`}
                className={cn(
                  'grid gap-6 opacity-0 translate-y-2',
                  lead ? 'lg:grid-cols-12 lg:gap-8' : 'grid-cols-[96px_1fr] sm:grid-cols-[160px_1fr] lg:grid-cols-12 lg:gap-8 items-start',
                  isRevealed && 'animate-fade-up',
                )}
                style={{ '--stagger': Math.min(index + 1, 7) } as React.CSSProperties}
              >
                <div className={lead ? 'w-[72%] sm:w-1/2 lg:w-auto lg:col-span-4' : 'lg:col-span-2 lg:col-start-3'}>{photo(t, lead)}</div>
                <div className={lead ? 'lg:col-span-6 lg:col-start-6 lg:pt-28 flex flex-col' : 'lg:col-span-6 lg:col-start-6'}>
                  <h3 className={cn('text-white font-semibold leading-snug', lead ? 'text-lg order-2 mt-6' : 'text-base')}>{t.name}</h3>
                  {t.detail && <p className={cn('text-white/64 text-sm leading-relaxed', lead && 'order-3')}>{t.detail}</p>}
                  <blockquote
                    className={cn(
                      'text-white leading-snug',
                      lead ? 'order-1 text-[clamp(1.25rem,2vw,1.75rem)] font-medium leading-snug max-w-[34ch]' : 'mt-2 text-base sm:text-lg text-white/80 leading-relaxed max-w-[52ch]',
                    )}
                  >
                    “{t.message}”
                  </blockquote>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
