import { cn } from '../shared/primitives/cn';
import { useInView } from '../shared/hooks/useInView';
import { buildSrcSet } from '../../lib/utils/buildSrcSet';
import { getAuthUser } from '../../lib/auth';
import { Link } from './Link';
import { TodayBoard } from './landing/TodayBoard';
import type { HeroContent, BrandContent, ContactContent } from '../../lib/api/siteContent';

/**
 * Landing hero — "split stage" (DESIGN.md v2, Marketing surface).
 * Left: the claim, the facts, the one action and the live board of today's
 * open places (Renfit's 4-per-hour rule made visible). Right: one photograph
 * of the gym, with opening hours and the address on its bottom edge.
 */
interface HeroProps {
  /** Callback ref for tracking hero visibility (used by StickyCTABar). */
  heroRef?: (node: HTMLElement | null) => void;
  content?: { hero: HeroContent; brand: BrandContent; contact?: ContactContent };
}

const DEFAULT_HERO: HeroContent = {
  headline_line1: 'Phòng tập riêng.',
  headline_line2: '4 người',
  headline_line3: 'mỗi giờ.',
  description:
    'Tập cùng huấn luyện viên cá nhân trong một phòng tập không bao giờ đông, đo InBody để thấy tiến độ thật, và đặt lịch trên ứng dụng chỉ trong vài giây.',
  background_image:
    'https://images.unsplash.com/photo-1637666062717-1c6bcfa4a4df?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920',
  stats: [
    { icon: 'Users', value: '4', label: 'người tối đa mỗi khung giờ' },
    { icon: 'Dumbbell', value: '08–21', label: 'mở cửa Thứ 2 – Thứ 7' },
    { icon: 'Star', value: '12', label: 'ngày đặt lịch trước' },
  ],
};

export function Hero({ heroRef, content }: HeroProps) {
  const { ref: revealRef, isRevealed } = useInView<HTMLDivElement>({ threshold: 0.1 });
  const hero = content?.hero ?? DEFAULT_HERO;
  const contact = content?.contact;
  const bgImage = hero.background_image || DEFAULT_HERO.background_image;
  const user = getAuthUser();
  const bookTo = user ? '/dashboard' : '/signup';
  const secondLine = [hero.headline_line2, hero.headline_line3].filter(Boolean).join(' ');
  const firstHours = contact?.hours?.split('\n')[0]?.trim();
  const srcSet = buildSrcSet(bgImage, [640, 1080, 1920]);

  return (
    <section
      ref={heroRef}
      className="relative pt-[68px] sm:pt-[76px] px-3 pb-3 lg:min-h-[100svh] grid gap-3 lg:grid-cols-2"
    >
      {/* Photograph — first on phones, right half on desktop */}
      <div className="relative order-2 h-[48svh] sm:h-[56svh] lg:h-[calc(100svh-88px)] lg:sticky lg:top-[76px] rounded-panel overflow-hidden bg-surface">
        <img
          src={bgImage}
          alt="Khu tập tại Renfit"
          className="absolute inset-0 w-full h-full object-cover brightness-[0.85]"
          width={1920}
          height={1080}
          fetchpriority="high"
          srcSet={srcSet}
          sizes={srcSet ? '(min-width: 1024px) 50vw, 100vw' : undefined}
        />
        {(firstHours || contact?.address) && (
          <div className="absolute inset-x-0 bottom-0 bg-[#0B0B0B] px-4 sm:px-5 py-3 flex flex-wrap items-center justify-between gap-x-6 gap-y-1 text-sm">
            {firstHours && <span className="text-white tabular-nums">{firstHours}</span>}
            {contact?.address && <span className="text-white/64 truncate">{contact.address}</span>}
          </div>
        )}
      </div>

      {/* Reading column */}
      <div
        ref={revealRef}
        className={cn(
          'order-1 flex flex-col justify-center px-3 sm:px-6 lg:px-12 xl:px-16 pt-6 pb-4 lg:py-10',
          'opacity-0 translate-y-2',
          isRevealed && 'animate-fade-up',
        )}
      >
        <h1 className="text-white font-bold leading-[1.08] text-[clamp(2.25rem,4.1vw,3.875rem)]">
          <span className="block">{hero.headline_line1}</span>
          {secondLine && <span className="block text-primary-text">{secondLine}</span>}
        </h1>

        <p className="mt-5 text-white/80 text-base sm:text-lg leading-relaxed max-w-[46ch]">{hero.description}</p>

        {hero.stats.length > 0 && (
          <dl className="mt-7 grid grid-cols-3 gap-4 max-w-lg">
            {hero.stats.slice(0, 3).map((s, i) => (
              <div key={i} className="min-w-0">
                <dt className="sr-only">{s.label}</dt>
                <dd className="text-white text-2xl sm:text-[28px] font-semibold tabular-nums leading-none">{s.value}</dd>
                <dd className="mt-1.5 text-white/64 text-sm leading-snug">{s.label}</dd>
              </div>
            ))}
          </dl>
        )}

        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
          <Link
            to={bookTo}
            className="inline-flex items-center justify-center rounded-full bg-primary hover:bg-primary-hover text-white font-semibold px-7 py-3.5 transition-colors active:scale-[0.97]"
          >
            Đặt lịch tập
          </Link>
          {!user && (
            <Link to="/login" className="text-white/80 hover:text-white text-sm underline underline-offset-4 decoration-white/30 hover:decoration-white">
              Đã là hội viên? Đăng nhập
            </Link>
          )}
        </div>

        <TodayBoard ctaTo={bookTo} className="mt-10 max-w-lg" />
      </div>
    </section>
  );
}
