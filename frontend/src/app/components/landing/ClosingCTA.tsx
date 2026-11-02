import { SectionAtmosphere } from './SectionAtmosphere';
import { Button } from '../../shared/primitives/Button';
import { cn } from '../../shared/primitives/cn';
import { useInView } from '../../shared/hooks/useInView';
import { Link } from '../Link';
import type { ClosingCtaContent } from '../../../lib/api/siteContent';

interface ClosingCTAProps {
  content?: ClosingCtaContent;
}

const DEFAULT_CLOSING_CTA: ClosingCtaContent = {
  title: 'Sẵn Sàng Bắt Đầu?',
  subtitle:
    'Tham gia cùng hơn 100 hội viên đã tin tưởng Renfit cho hành trình nâng tầm thể chất của họ. Đặt lịch hôm nay.',
  primary_button_label: 'Bắt Đầu Hành Trình',
  secondary_button_label: 'Gặp Đội Ngũ HLV',
};

/**
 * Closing call-to-action section rendered before the Footer.
 * Provides a clear next step at the end of the page narrative.
 */
export function ClosingCTA({ content }: ClosingCTAProps) {
  const { ref, isRevealed } = useInView<HTMLElement>();
  const data = content ?? DEFAULT_CLOSING_CTA;

  // Split title for emerald highlight — "Sẵn Sàng" white, "Bắt Đầu?" emerald
  const titleParts = data.title.split(' ');
  const titleFirst = titleParts.slice(0, 2).join(' ');
  const titleRest = titleParts.slice(2).join(' ');

  return (
    <section className="relative py-12 sm:py-16 lg:py-24 px-4 sm:px-6 bg-[#0B0B0B]" ref={ref}>
      <SectionAtmosphere glows={3} positions={[{ x: 20, y: 30 }, { x: 50, y: 60 }, { x: 80, y: 25 }]} mask />

      <div className={cn(
        'relative z-10 max-w-3xl mx-auto text-center opacity-0 translate-y-2',
        isRevealed && 'animate-fade-up',
      )}>
        <h2 className="text-xl sm:text-3xl lg:text-5xl font-bold text-white mb-4 sm:mb-6 leading-relaxed">
          {titleFirst}{titleRest ? ' ' : ''}<span className="text-[#0F6B3E]">{titleRest}</span>
        </h2>
        <p className="text-sm sm:text-base lg:text-lg text-white/70 mb-6 sm:mb-10 leading-relaxed">
          {data.subtitle}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/login">
            <Button variant="primary" size="lg">
              {data.primary_button_label}
            </Button>
          </Link>
          <a href="#trainers">
            <Button variant="secondary" size="lg">
              {data.secondary_button_label}
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
}
