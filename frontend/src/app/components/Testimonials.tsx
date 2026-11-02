import { Quote } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { SectionAtmosphere } from './landing/SectionAtmosphere';
import { Card } from '../shared/primitives/Card';
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
 * Landing "Khách hàng ở Renfit nói gì" — customer photo + quote cards.
 * Phones get a swipeable, snap-aligned row (user-driven, never auto-scrolling);
 * tablets/desktop get a grid. Content is CMS-managed (CmsEditor → testimonials).
 */
export function Testimonials({ content }: TestimonialsProps) {
  const { ref, isRevealed } = useInView<HTMLElement>();
  const data = content ?? DEFAULT_TESTIMONIALS;
  const items = data.items.filter((t) => t.name.trim() && t.message.trim());

  if (items.length === 0) return null;

  // "Khách hàng ở Renfit" white, "nói gì" emerald.
  const words = data.title.trim().split(' ');
  const splitAt = Math.max(words.length - 2, 1);
  const titleFirst = words.slice(0, splitAt).join(' ');
  const titleRest = words.slice(splitAt).join(' ');

  return (
    <section
      id="testimonials"
      ref={ref}
      aria-labelledby="testimonials-title"
      className="scroll-mt-24 relative py-12 sm:py-16 lg:py-24 px-4 sm:px-6 bg-[#0B0B0B]"
    >
      <SectionAtmosphere glows={2} positions={[{ x: 75, y: 30 }, { x: 25, y: 75 }]} />

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className={cn('text-center mb-8 sm:mb-12 lg:mb-16 opacity-0 translate-y-2', isRevealed && 'animate-fade-up')}>
          <h2
            id="testimonials-title"
            className="text-xl sm:text-3xl lg:text-5xl font-bold text-white mb-3 sm:mb-6 leading-relaxed"
          >
            {titleFirst}
            {titleRest ? ' ' : ''}
            <span className="text-[#0F6B3E]">{titleRest}</span>
          </h2>
          {data.subtitle && (
            <p className="text-sm sm:text-base lg:text-lg text-white/70 max-w-2xl mx-auto leading-relaxed">
              {data.subtitle}
            </p>
          )}
        </div>

        <ul
          data-testid="testimonials-list"
          className={cn(
            // Phone: horizontal swipe row that bleeds to the screen edge.
            'flex gap-3 overflow-x-auto snap-x snap-mandatory overscroll-x-contain -mx-4 px-4 pb-2',
            '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
            // Tablet/desktop: grid.
            'sm:mx-0 sm:px-0 sm:pb-0 sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible lg:grid-cols-3 lg:gap-6',
          )}
        >
          {items.map((t, index) => (
            <li
              key={`${t.name}-${index}`}
              className={cn(
                'snap-center shrink-0 w-[80%] sm:w-auto opacity-0 translate-y-2',
                isRevealed && 'animate-fade-up',
              )}
              style={{ '--stagger': Math.min(index + 1, 7) } as React.CSSProperties}
            >
              <Card
                tier="card"
                className="group h-full flex flex-col p-0 overflow-hidden transition-all duration-[var(--motion-base)] hover:border-[#0F6B3E]/50 hover:shadow-[0_0_30px_rgba(15,107,62,0.35)]"
              >
                {/* 1 — Big portrait photo (the hero of the card). `object-top` keeps
                    faces in frame, since they sit in the upper part of portraits. */}
                <div className="relative overflow-hidden bg-white/5" style={{ aspectRatio: '4/5' }}>
                  {t.image ? (
                    <ImageWithFallback
                      src={t.image}
                      alt={t.name}
                      className="w-full h-full object-cover object-top transition-transform duration-[var(--motion-slow)] group-hover:scale-105"
                      loading="lazy"
                      decoding="async"
                      width={800}
                      height={1000}
                      srcSet={buildSrcSet(t.image, [480, 800, 1200])}
                      sizes={
                        buildSrcSet(t.image, [480, 800, 1200])
                          ? '(max-width: 640px) 80vw, (max-width: 1024px) 50vw, 33vw'
                          : undefined
                      }
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#0F6B3E]/40 to-black">
                      <span className="text-white/80 text-6xl font-bold leading-relaxed">{t.name.trim().charAt(0)}</span>
                    </div>
                  )}
                  {/* Soft fade into the card body so the photo blends with the text below */}
                  <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-[#0B0B0B]/90 to-transparent" aria-hidden />
                </div>

                {/* 2 — Name */}
                <div className="px-5 pt-4 sm:px-6">
                  <h3 className="text-white text-lg sm:text-xl font-bold leading-relaxed">{t.name}</h3>
                  {t.detail && <p className="text-[#0F6B3E] text-sm font-medium leading-relaxed">{t.detail}</p>}
                </div>

                {/* 3 — What they say about Renfit */}
                <div className="flex-1 flex gap-2 px-5 pt-3 pb-5 sm:px-6 sm:pb-6">
                  <Quote className="w-5 h-5 text-[#0F6B3E] shrink-0 mt-0.5" aria-hidden />
                  <blockquote className="text-white/75 text-sm sm:text-base leading-relaxed">{t.message}</blockquote>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
