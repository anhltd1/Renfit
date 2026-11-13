import { ImageWithFallback } from './figma/ImageWithFallback';
import { cn } from '../shared/primitives/cn';
import { useInView } from '../shared/hooks/useInView';
import { buildSrcSet } from '../../lib/utils/buildSrcSet';
import type { TrainersContent } from '../../lib/api/siteContent';

interface TrainersProps {
  content?: TrainersContent;
}

const DEFAULT_TRAINERS: TrainersContent = {
  title: 'Đội Ngũ Huấn Luyện Viên',
  subtitle:
    'Các chuyên gia được chứng nhận quốc tế, sẵn sàng đồng hành cùng bạn trên con đường chinh phục mục tiêu.',
  items: [
    {
      name: 'Trần Minh Quân',
      specialty: 'Strength & Conditioning',
      experience: '8 năm kinh nghiệm',
      image: 'https://images.unsplash.com/photo-1584466977773-e625c37cdd50?w=400',
      certifications: 'NASM-CPT, CSCS',
    },
    {
      name: 'Nguyễn Thị Hương',
      specialty: 'Weight Loss & Nutrition',
      experience: '6 năm kinh nghiệm',
      image: 'https://images.unsplash.com/photo-1571732154690-f6d1c3e5178a?w=400',
      certifications: 'ACE-CPT, PN-1',
    },
    {
      name: 'Lê Văn Tuấn',
      specialty: 'Bodybuilding & Hypertrophy',
      experience: '10 năm kinh nghiệm',
      image: 'https://images.unsplash.com/photo-1519311965067-36d3e5f33d39?w=400',
      certifications: 'ISSA-CPT, IFBB Pro',
    },
    {
      name: 'Phạm Thu Trang',
      specialty: 'Functional Training',
      experience: '5 năm kinh nghiệm',
      image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400',
      certifications: 'NASM-CPT, TRX',
    },
  ],
};

export function Trainers({ content }: TrainersProps) {
  const { ref, isRevealed } = useInView<HTMLElement>();
  const data = content ?? DEFAULT_TRAINERS;

  // DESIGN.md v2 marketing: the trainers as people — portrait, name, what
  // they coach, years and certificates as plain text. No badges, no glow.
  return (
    <section id="trainers" className="scroll-mt-24 py-16 sm:py-24 px-4 sm:px-6 lg:px-10" ref={ref}>
      <div className="max-w-7xl mx-auto">
        <div className={cn('max-w-2xl opacity-0 translate-y-2', isRevealed && 'animate-fade-up')}>
          <h2 className="text-white font-bold leading-[1.15] text-[clamp(1.75rem,3.5vw,2.75rem)]">{data.title}</h2>
          <p className="mt-4 text-white/80 text-base sm:text-lg leading-relaxed">{data.subtitle}</p>
        </div>

        {/* Flex-wrap + fixed widths (2 / row on phones, 4 / row on desktop) so an
            incomplete last row is centred instead of hugging the left edge. */}
        <ul className="mt-12 flex flex-wrap justify-center gap-x-4 gap-y-10 sm:gap-x-6">
          {data.items.map((trainer, index) => {
            const srcSet = buildSrcSet(trainer.image, [320, 400, 640]);
            return (
              <li
                key={index}
                className={cn(
                  'w-[calc(50%-0.5rem)] sm:w-[calc(50%-0.75rem)] lg:w-[calc(25%-1.125rem)] opacity-0 translate-y-2',
                  isRevealed && 'animate-fade-up',
                )}
                style={{ '--stagger': Math.min(index + 1, 7) } as React.CSSProperties}
              >
                <ImageWithFallback
                  src={trainer.image}
                  alt={trainer.name}
                  className="w-full aspect-[3/4] object-cover rounded-panel bg-surface"
                  loading="lazy"
                  decoding="async"
                  width={400}
                  height={533}
                  srcSet={srcSet}
                  sizes={srcSet ? '(max-width: 1024px) 50vw, 25vw' : undefined}
                />
                <h3 className="mt-4 text-white text-base sm:text-lg font-semibold leading-snug">{trainer.name}</h3>
                <p className="mt-1 text-white/80 text-sm leading-relaxed">{trainer.specialty}</p>
                <p className="mt-2 text-white/64 text-sm leading-relaxed">
                  {[trainer.experience, trainer.certifications].filter(Boolean).join(' · ')}
                </p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
