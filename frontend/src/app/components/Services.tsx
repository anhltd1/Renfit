import { ArrowRight } from 'lucide-react';
import { cn } from '../shared/primitives/cn';
import { CapacityMarks } from '../shared/booking/CapacityMarks';
import { resolveIcon } from '../../lib/icons/iconAllowlist';
import { getAuthUser } from '../../lib/auth';
import { Link } from './Link';
import { useInView } from '../shared/hooks/useInView';
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
  const bookTo = getAuthUser() ? '/dashboard' : '/signup';

  // DESIGN.md v2 marketing: the services as one bordered sheet split into
  // cells by 1px lines — the same panel language as the hero's live board and
  // the AI Coach panel. Each cell: a quiet 20px icon (the CMS icon, grey, no
  // chip), the name, one line. Heading column left with the one action.
  return (
    <section id="services" className="scroll-mt-24 bg-surface py-16 sm:py-24 px-4 sm:px-6 lg:px-10" ref={ref}>
      <div className="max-w-7xl mx-auto grid gap-10 lg:gap-12 lg:grid-cols-12 items-start">
        <div className={cn('lg:col-span-4 lg:sticky lg:top-28 opacity-0 translate-y-2', isRevealed && 'animate-fade-up')}>
          <h2 className="text-white font-bold leading-[1.15] text-[clamp(1.75rem,3.5vw,2.75rem)]">{data.title}</h2>
          <p className="mt-4 text-white/80 text-base sm:text-lg leading-relaxed max-w-[40ch]">{data.subtitle}</p>
          <p className="mt-6 flex items-center gap-2.5 text-white/64 text-sm">
            <CapacityMarks taken={2} /> Mọi dịch vụ đều trong khung giờ tối đa 4 người.
          </p>
          <Link
            to={bookTo}
            className="mt-8 inline-flex items-center gap-2 text-white text-sm font-semibold underline underline-offset-4 decoration-white/30 hover:decoration-white"
          >
            Đặt buổi tập đầu tiên <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>

        <ul
          data-testid="services-list"
          className={cn(
            'lg:col-span-8 grid sm:grid-cols-2 gap-px bg-line border border-line rounded-panel overflow-hidden opacity-0 translate-y-2',
            isRevealed && 'animate-fade-up',
          )}
          style={{ '--stagger': 1 } as React.CSSProperties}
        >
          {data.items.map((service, index) => {
            const Icon = resolveIcon(service.icon);
            return (
              <li
                key={index}
                className={cn(
                  'bg-[#0B0B0B] p-5 sm:p-7 flex flex-col sm:min-h-[11rem]',
                  // An odd last cell takes the full row instead of leaving a hole.
                  data.items.length % 2 === 1 && index === data.items.length - 1 && 'sm:col-span-2',
                )}
              >
                {Icon && <Icon className="w-5 h-5 text-white/64" aria-hidden="true" strokeWidth={1.5} />}
                <h3 className="mt-auto pt-5 sm:pt-8 text-white text-lg font-semibold leading-snug">{service.title}</h3>
                <p className="mt-1.5 text-white/64 text-sm sm:text-base leading-relaxed">{service.description}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
