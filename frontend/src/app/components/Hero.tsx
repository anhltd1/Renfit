import { ImageWithFallback } from './figma/ImageWithFallback';
import logoImage from '../../imports/image.png';
import { SectionAtmosphere } from './landing/SectionAtmosphere';
import { Card } from '../shared/primitives/Card';
import { cn } from '../shared/primitives/cn';
import { useInView } from '../shared/hooks/useInView';
import { resolveIcon } from '../../lib/icons/iconAllowlist';
import { buildSrcSet } from '../../lib/utils/buildSrcSet';
import type { HeroContent, BrandContent } from '../../lib/api/siteContent';

interface HeroProps {
  /** Callback ref for tracking hero visibility (used by StickyCTABar). */
  heroRef?: (node: HTMLElement | null) => void;
  content?: { hero: HeroContent; brand: BrandContent };
}

const DEFAULT_HERO: HeroContent = {
  headline_line1: 'Nâng Tầm Thể Chất.',
  headline_line2: 'Kiến Tạo Phiên Bản',
  headline_line3: 'Tốt Nhất Của Bạn.',
  description:
    'Phòng gym riêng tư cao cấp với huấn luyện viên cá nhân chuyên nghiệp, hỗ trợ AI thông minh và chương trình tập luyện được cá nhân hóa hoàn toàn.',
  background_image:
    'https://images.unsplash.com/photo-1637666062717-1c6bcfa4a4df?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920',
  stats: [
    { icon: 'Users', value: '100+', label: 'Hội viên' },
    { icon: 'Dumbbell', value: '10+', label: 'Huấn luyện viên' },
    { icon: 'Star', value: '95%', label: 'Hài lòng' },
  ],
};

export function Hero({ heroRef, content }: HeroProps) {
  const { ref: revealRef, isRevealed } = useInView<HTMLDivElement>({ threshold: 0.1 });
  const hero = content?.hero ?? DEFAULT_HERO;
  const brand = content?.brand;
  const bgImage = hero.background_image || DEFAULT_HERO.background_image;

  return (
    <section
      ref={heroRef}
      className="relative min-h-[85svh] lg:min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={bgImage}
          alt="Phòng tập gym cao cấp"
          className="w-full h-full object-cover"
          width={1920}
          height={1080}
          fetchpriority="high"
          srcSet={buildSrcSet(bgImage, [640, 1080, 1920])}
          sizes={buildSrcSet(bgImage, [640, 1080, 1920]) ? '100vw' : undefined}
          style={{ aspectRatio: '16/9' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-[#0B0B0B]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0F6B3E]/20 to-transparent" />
      </div>

      {/* Atmosphere substrate */}
      <SectionAtmosphere
        glows={2}
        positions={[{ x: 25, y: 40 }, { x: 75, y: 70 }]}
      />

      {/* Content */}
      <div
        ref={revealRef}
        className={cn(
          'relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-20 text-center',
          'opacity-0 translate-y-2',
          isRevealed && 'animate-fade-up',
        )}
      >
        {/* Logo */}
        <div className="flex justify-center mb-6 sm:mb-8">
          <ImageWithFallback
            src={logoImage}
            alt="Renfit Logo"
            className="h-14 sm:h-20 lg:h-24 w-auto"
          />
        </div>

        {/* Tagline */}
        {brand?.tagline && (
          <p className="text-white/60 text-sm sm:text-base leading-relaxed mb-4">
            {brand.tagline}
          </p>
        )}

        {/* Main Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-7xl font-bold mb-4 sm:mb-6 leading-tight">
          <span className="text-white">{hero.headline_line1}</span>
          <br />
          <span className="text-white">{hero.headline_line2}</span>
          <br />
          <span className="text-[#0F6B3E]">{hero.headline_line3}</span>
        </h1>

        {/* Supporting Text */}
        <p className="text-base sm:text-lg lg:text-xl text-white/80 max-w-3xl mx-auto mb-8 sm:mb-10 leading-relaxed">
          {hero.description}
        </p>

        {/* Stats Strip — always 3-col horizontal */}
        <div className="grid grid-cols-3 gap-3 sm:gap-6 max-w-4xl mx-auto">
          {hero.stats.map((stat, index) => {
            const Icon = resolveIcon(stat.icon);
            return (
              <Card key={index} tier="card" compact className="text-center">
                {Icon && (
                  <div className="flex items-center justify-center mb-1 sm:mb-3">
                    <Icon className="w-5 h-5 sm:w-8 sm:h-8 text-[#0F6B3E]" />
                  </div>
                )}
                <div className="text-xl sm:text-4xl font-bold text-white mb-0.5 sm:mb-2">{stat.value}</div>
                <div className="text-white/60 text-xs sm:text-base leading-relaxed">{stat.label}</div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 sm:h-32 bg-gradient-to-t from-[#0B0B0B] to-transparent z-10" />
    </section>
  );
}
