import { ImageWithFallback } from './figma/ImageWithFallback';
import { cn } from '../shared/primitives/cn';
import { useInView } from '../shared/hooks/useInView';
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
  const srcSet = buildSrcSet(mainImage, [640, 1080]);

  // DESIGN.md v2 marketing: "square plate, spare text" — one photograph of
  // the room beside the argument; features as a plain two-column list.
  return (
    <section id="about" className="scroll-mt-24 py-16 sm:py-24 px-4 sm:px-6 lg:px-10" ref={ref}>
      <div className="max-w-7xl mx-auto grid gap-10 lg:gap-16 lg:grid-cols-2 items-center">
        <figure
          className={cn('m-0 order-2 lg:order-1 opacity-0 translate-y-2', isRevealed && 'animate-fade-up')}
        >
          <ImageWithFallback
            src={mainImage}
            alt={data.main_image_title || 'Không gian tập tại Renfit'}
            className="w-full aspect-square object-cover rounded-panel"
            loading="lazy"
            decoding="async"
            width={1080}
            height={1080}
            srcSet={srcSet}
            sizes={srcSet ? '(min-width: 1024px) 50vw, 100vw' : undefined}
          />
          {data.main_image_title && (
            <figcaption className="mt-3 text-sm text-white/64 leading-relaxed">
              <span className="text-white">{data.main_image_title}.</span> {data.main_image_description}
            </figcaption>
          )}
        </figure>

        <div
          className={cn('order-1 lg:order-2 opacity-0 translate-y-2', isRevealed && 'animate-fade-up')}
          style={{ '--stagger': 1 } as React.CSSProperties}
        >
          <h2 className="text-white font-bold leading-[1.15] text-[clamp(1.75rem,3.5vw,2.75rem)] max-w-[18ch]">{data.title}</h2>
          <p className="mt-5 text-white/80 text-base sm:text-lg leading-relaxed max-w-[46ch]">{data.subtitle}</p>

          <dl className="mt-10 grid gap-x-10 gap-y-7 sm:grid-cols-2">
            {data.features.map((feature, index) => (
              <div key={index}>
                <dt className="text-white text-base font-semibold leading-relaxed">{feature.title}</dt>
                <dd className="mt-1 text-white/64 text-sm sm:text-base leading-relaxed">{feature.description}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
