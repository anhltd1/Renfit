import { SectionAtmosphere } from './landing/SectionAtmosphere';
import { Card } from '../shared/primitives/Card';
import { cn } from '../shared/primitives/cn';
import { useInView } from '../shared/hooks/useInView';
import { resolveIcon } from '../../lib/icons/iconAllowlist';
import type { ServicesContent } from '../../lib/api/siteContent';

interface ServicesProps {
  content?: ServicesContent;
}

const DEFAULT_SERVICES: ServicesContent = {
  title: 'Dịch Vụ Của Chúng Tôi',
  subtitle: 'Giải pháp tập luyện toàn diện với sự kết hợp của công nghệ và chuyên môn.',
  items: [
    {
      icon: 'Dumbbell',
      title: 'Personal Training',
      description: 'Huấn luyện viên cá nhân 1-1 với chương trình được thiết kế riêng cho bạn.',
    },
    {
      icon: 'Bot',
      title: 'AI Fitness Coach',
      description: 'Trợ lý AI thông minh hỗ trợ bạn 24/7, trả lời mọi câu hỏi về tập luyện.',
    },
    {
      icon: 'Apple',
      title: 'Tư Vấn Dinh Dưỡng',
      description: 'Chế độ ăn uống khoa học, cân đối dinh dưỡng phù hợp với mục tiêu.',
    },
    {
      icon: 'TrendingUp',
      title: 'Strength & Conditioning',
      description: 'Xây dựng sức mạnh và thể lực toàn diện với bài tập chuyên sâu.',
    },
    {
      icon: 'Scale',
      title: 'Giảm Cân',
      description: 'Chương trình giảm cân khoa học, an toàn và hiệu quả lâu dài.',
    },
    {
      icon: 'Flame',
      title: 'Tăng Cơ',
      description: 'Phát triển khối lượng cơ bắp với phương pháp tập luyện tối ưu.',
    },
  ],
};

export function Services({ content }: ServicesProps) {
  const { ref, isRevealed } = useInView<HTMLElement>();
  const data = content ?? DEFAULT_SERVICES;

  // Split title for emerald highlight on last words
  const titleParts = data.title.split(' ');
  // Original: "Dịch Vụ" white, "Của Chúng Tôi" emerald — split at first 2 words
  const titleFirst = titleParts.slice(0, 2).join(' ');
  const titleRest = titleParts.slice(2).join(' ');

  return (
    <section id="services" className="scroll-mt-24 relative py-12 sm:py-16 lg:py-24 px-4 sm:px-6 bg-[#0B0B0B]" ref={ref}>
      <SectionAtmosphere glows={2} positions={[{ x: 30, y: 20 }, { x: 70, y: 70 }]} />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section Header */}
        <div className={cn(
          'text-center mb-6 sm:mb-10 lg:mb-16 opacity-0 translate-y-2',
          isRevealed && 'animate-fade-up',
        )}>
          <h2 className="text-xl sm:text-3xl lg:text-5xl font-bold text-white mb-3 sm:mb-6 leading-relaxed">
            {titleFirst}{titleRest ? ' ' : ''}<span className="text-[#0F6B3E]">{titleRest}</span>
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-white/70 max-w-2xl mx-auto leading-relaxed">
            {data.subtitle}
          </p>
        </div>

        {/* Services: 2-col grid on mobile, 3-col desktop — compact cards */}
        <div className={cn(
          'grid grid-cols-2 gap-2.5',
          'sm:gap-4',
          'lg:grid-cols-3 lg:gap-6',
        )}>
          {data.items.map((service, index) => {
            const Icon = resolveIcon(service.icon);
            return (
              <div
                key={index}
                className={cn(
                  'opacity-0 translate-y-2',
                  isRevealed && 'animate-fade-up',
                )}
                style={{ '--stagger': Math.min(index + 1, 7) } as React.CSSProperties}
              >
                <Card
                  tier="card"
                  compact
                  className="h-full transition-all duration-[var(--motion-base)] hover:border-[#0F6B3E]/50 hover:-translate-y-0.5 active:scale-[0.97]"
                >
                  <div className="w-8 h-8 sm:w-12 sm:h-12 lg:w-16 lg:h-16 rounded-xl sm:rounded-2xl bg-[#0F6B3E]/20 flex items-center justify-center mb-2 sm:mb-4 lg:mb-6">
                    {Icon && <Icon className="w-4 h-4 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-[#0F6B3E]" />}
                  </div>

                  <h3 className="text-xs sm:text-base lg:text-xl font-bold text-white mb-1 sm:mb-2 lg:mb-4 leading-relaxed">
                    {service.title}
                  </h3>

                  <p className="text-white/70 text-[10px] sm:text-xs lg:text-sm leading-relaxed">
                    {service.description}
                  </p>
                </Card>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
