import { cn } from '../../shared/primitives/cn';
import { useInView } from '../../shared/hooks/useInView';
import { buildSrcSet } from '../../../lib/utils/buildSrcSet';
import { getAuthUser } from '../../../lib/auth';
import { Link } from '../Link';
import type { ClosingCtaContent } from '../../../lib/api/siteContent';

interface ClosingCTAProps {
  content?: ClosingCtaContent;
  /** The last photograph — the room the visitor will train in. */
  image?: string;
}

const DEFAULT_CLOSING_CTA: ClosingCtaContent = {
  title: 'Đặt buổi tập đầu tiên',
  subtitle: 'Chọn một khung giờ còn chỗ — huấn luyện viên sẽ xác nhận và liên hệ với bạn trước buổi tập.',
  primary_button_label: 'Đặt lịch tập',
  secondary_button_label: 'Gặp huấn luyện viên',
};

/**
 * Closing call to action — "last photograph, text beside" (DESIGN.md v2
 * marketing). A full-width photograph of the gym with the closing line and
 * the one action confined to its calm half; on phones the text sits below.
 */
export function ClosingCTA({ content, image }: ClosingCTAProps) {
  const { ref, isRevealed } = useInView<HTMLElement>();
  const data = content ?? DEFAULT_CLOSING_CTA;
  const user = getAuthUser();
  const srcSet = image ? buildSrcSet(image, [1080, 1920]) : undefined;

  return (
    <section ref={ref} className="px-3 pb-3">
      <div className="relative rounded-panel overflow-hidden bg-surface lg:min-h-[80svh] lg:flex lg:items-end">
        {image && (
          <img
            src={image}
            alt=""
            aria-hidden="true"
            loading="lazy"
            decoding="async"
            width={1920}
            height={1080}
            srcSet={srcSet}
            sizes={srcSet ? '100vw' : undefined}
            className="w-full h-[60svh] lg:h-full lg:absolute lg:inset-0 object-cover brightness-[0.55]"
          />
        )}
        <div
          className={cn('relative w-full px-5 py-10 sm:px-10 lg:py-16 lg:pl-[52%] lg:pr-16', isRevealed && 'animate-fade-up')}
        >
          <h2 className="text-white font-bold leading-[1.1] text-[clamp(1.75rem,3.4vw,3rem)] max-w-[16ch]">{data.title}</h2>
          <p className="mt-4 text-white/80 text-base sm:text-lg leading-relaxed max-w-[42ch]">{data.subtitle}</p>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
            <Link
              to={user ? '/dashboard' : '/signup'}
              className="inline-flex items-center justify-center rounded-full bg-primary hover:bg-primary-hover text-white font-semibold px-7 py-3.5 transition-colors active:scale-[0.97]"
            >
              {data.primary_button_label}
            </Link>
            <a href="#trainers" className="text-white/80 hover:text-white text-sm underline underline-offset-4 decoration-white/30 hover:decoration-white">
              {data.secondary_button_label}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
