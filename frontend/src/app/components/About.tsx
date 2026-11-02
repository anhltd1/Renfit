import { ImageWithFallback } from './figma/ImageWithFallback';
import { SectionAtmosphere } from './landing/SectionAtmosphere';
import { Card } from '../shared/primitives/Card';
import { cn } from '../shared/primitives/cn';
import { useInView } from '../shared/hooks/useInView';
import { resolveIcon } from '../../lib/icons/iconAllowlist';
import { buildSrcSet } from '../../lib/utils/buildSrcSet';
import type { AboutContent } from '../../lib/api/siteContent';

interface AboutProps {
  content?: AboutContent;
}

const DEFAULT_ABOUT: AboutContent = {
  title: 'Về Renfit',
  subtitle:
    'Không gian tập luyện cao cấp với môi trường riêng tư, trang thiết bị hiện đại và đội ngũ huấn luyện viên chuyên nghiệp.',
  main_image:
    'https://images.unsplash.com/photo-1637430308606-86576d8fef3c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
  main_image_title: 'Không Gian Tập Luyện Đẳng Cấp',
  main_image_description:
    'Thiết bị cao cấp từ các thương hiệu hàng đầu thế giới, đáp ứng mọi nhu cầu tập luyện của bạn.',
  features: [
    {
      icon: 'Target',
      title: 'Mục Tiêu Cá Nhân',
      description: 'Chương trình tập luyện được thiết kế riêng dựa trên mục tiêu và thể trạng của bạn.',
    },
    {
      icon: 'Award',
      title: 'HLV Chuyên Nghiệp',
      description: 'Đội ngũ HLV được chứng nhận quốc tế với kinh nghiệm nhiều năm.',
    },
    {
      icon: 'Heart',
      title: 'Theo Dõi Sức Khỏe',
      description: 'Giám sát tiến trình và sức khỏe toàn diện với công nghệ hiện đại.',
    },
    {
      icon: 'Zap',
      title: 'Kết Quả Nhanh',
      description: 'Phương pháp khoa học giúp bạn đạt mục tiêu trong thời gian ngắn nhất.',
    },
  ],
};

export function About({ content }: AboutProps) {
  const { ref, isRevealed } = useInView<HTMLElement>();
  const data = content ?? DEFAULT_ABOUT;
  const mainImage = data.main_image || DEFAULT_ABOUT.main_image;

  // Split title into parts for the emerald highlight (last word)
  const titleParts = data.title.split(' ');
  const titleLast = titleParts.pop() ?? '';
  const titleFirst = titleParts.join(' ');

  return (
    <section id="about" className="scroll-mt-24 relative py-12 sm:py-16 lg:py-24 px-4 sm:px-6 bg-[#0B0B0B]" ref={ref}>
      <SectionAtmosphere glows={2} positions={[{ x: 15, y: 25 }, { x: 80, y: 65 }]} mask />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section Header */}
        <div className={cn(
          'text-center mb-6 sm:mb-10 lg:mb-16 opacity-0 translate-y-2',
          isRevealed && 'animate-fade-up',
        )}>
          <h2 className="text-xl sm:text-3xl lg:text-5xl font-bold text-white mb-3 sm:mb-6 leading-relaxed">
            {titleFirst}{titleFirst ? ' ' : ''}<span className="text-[#0F6B3E]">{titleLast}</span>
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-white/70 max-w-2xl mx-auto leading-relaxed">
            {data.subtitle}
          </p>
        </div>

        {/* Bento Grid — 2-col on mobile, 3-col on lg */}
        <div className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-3 lg:gap-6">
          {/* Large Image Card - Spans 2 columns on all breakpoints */}
          <div className={cn(
            'col-span-2 lg:row-span-2 relative rounded-2xl sm:rounded-3xl overflow-hidden group opacity-0 translate-y-2',
            isRevealed && 'animate-fade-up',
          )} style={{ '--stagger': 1 } as React.CSSProperties}>
            <ImageWithFallback
              src={mainImage}
              alt={data.main_image_title || 'Trang thiết bị phòng gym cao cấp'}
              className="w-full h-full object-cover"
              loading="lazy"
              decoding="async"
              width={1080}
              height={720}
              srcSet={buildSrcSet(mainImage, [640, 1080])}
              sizes={buildSrcSet(mainImage, [640, 1080]) ? '(max-width: 640px) 100vw, 66vw' : undefined}
              style={{ aspectRatio: '16/9' }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="absolute bottom-3 sm:bottom-6 lg:bottom-8 left-3 sm:left-6 lg:left-8 right-3 sm:right-6 lg:right-8">
              <h3 className="text-sm sm:text-xl lg:text-3xl font-bold text-white mb-1 sm:mb-2 lg:mb-3 leading-relaxed">
                {data.main_image_title}
              </h3>
              <p className="text-white/80 text-xs sm:text-sm lg:text-lg leading-relaxed hidden sm:block">
                {data.main_image_description}
              </p>
            </div>
          </div>

          {/* Feature Cards */}
          {data.features.map((feature, index) => {
            const Icon = resolveIcon(feature.icon);
            return (
              <Card
                key={index}
                tier="card"
                compact
                className={cn(
                  'opacity-0 translate-y-2 transition-all duration-[var(--motion-base)] hover:border-[#0F6B3E]/50 hover:-translate-y-0.5 active:scale-[0.97]',
                  isRevealed && 'animate-fade-up',
                )}
                style={{ '--stagger': index + 2 } as React.CSSProperties}
              >
                {Icon && <Icon className="w-7 h-7 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-[#0F6B3E] mb-2 sm:mb-3 lg:mb-4" />}
                <h3 className="text-xs sm:text-base lg:text-2xl font-bold text-white mb-1 sm:mb-2 lg:mb-3 leading-relaxed">{feature.title}</h3>
                <p className="text-white/70 text-[10px] sm:text-xs lg:text-base leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
