import { ImageWithFallback } from './figma/ImageWithFallback';
import { Award } from 'lucide-react';
import { SectionAtmosphere } from './landing/SectionAtmosphere';
import { Card } from '../shared/primitives/Card';
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
      image: 'https://images.unsplash.com/photo-1548542031-0b26d8ba1e0a?w=400',
      certifications: 'NASM-CPT, TRX',
    },
  ],
};

export function Trainers({ content }: TrainersProps) {
  const { ref, isRevealed } = useInView<HTMLElement>();
  const data = content ?? DEFAULT_TRAINERS;

  // Split title for emerald highlight — "Đội Ngũ" white, "Huấn Luyện Viên" emerald
  const titleParts = data.title.split(' ');
  const titleFirst = titleParts.slice(0, 2).join(' ');
  const titleRest = titleParts.slice(2).join(' ');

  return (
    <section id="trainers" className="scroll-mt-24 relative py-12 sm:py-16 lg:py-24 px-4 sm:px-6 bg-[#0B0B0B]" ref={ref}>
      <SectionAtmosphere glows={2} positions={[{ x: 20, y: 40 }, { x: 80, y: 25 }]} mask />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section Header */}
        <div className={cn(
          'text-center mb-8 sm:mb-16 opacity-0 translate-y-2',
          isRevealed && 'animate-fade-up',
        )}>
          <h2 className="text-xl sm:text-3xl lg:text-5xl font-bold text-white mb-4 sm:mb-6 leading-relaxed">
            {titleFirst}{titleRest ? ' ' : ''}<span className="text-[#0F6B3E]">{titleRest}</span>
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-white/70 max-w-2xl mx-auto leading-relaxed">
            {data.subtitle}
          </p>
        </div>

        {/* Trainers: 2-col on mobile, 2-col tablet, 4-col desktop */}
        <div className={cn(
          'grid grid-cols-2 gap-3',
          'sm:gap-4',
          'lg:grid-cols-4 lg:gap-6',
        )}>
          {data.items.map((trainer, index) => (
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
                hoverable
                className="h-full overflow-hidden p-0 transition-all duration-[var(--motion-base)] hover:scale-105 hover:shadow-[0_0_30px_rgba(15,107,62,0.5)] active:scale-[0.97]"
              >
                {/* Image — compact aspect ratio */}
                <div className="relative overflow-hidden" style={{ aspectRatio: '3/4' }}>
                  <ImageWithFallback
                    src={trainer.image}
                    alt={trainer.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                    width={400}
                    height={500}
                    srcSet={buildSrcSet(trainer.image, [320, 400, 640])}
                    sizes={buildSrcSet(trainer.image, [320, 400, 640]) ? '(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw' : undefined}
                    style={{ aspectRatio: '3/4' }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-80" />

                  {/* Certification Badge */}
                  {trainer.certifications && (
                    <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-[#0F6B3E]/90 backdrop-blur-sm px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full flex items-center gap-1">
                      <Award className="w-3 h-3 text-white" />
                      <span className="text-white text-[9px] sm:text-[10px] leading-relaxed">Chứng Chỉ</span>
                    </div>
                  )}
                </div>

                {/* Info — compact */}
                <div className="p-2.5 sm:p-4">
                  <h3 className="text-xs sm:text-base lg:text-lg font-bold text-white mb-0.5 sm:mb-1 leading-relaxed truncate">
                    {trainer.name}
                  </h3>
                  <p className="text-[#0F6B3E] text-[10px] sm:text-xs lg:text-sm mb-0.5 sm:mb-1 leading-relaxed truncate">{trainer.specialty}</p>
                  <p className="text-white/60 text-[10px] sm:text-xs mb-1.5 sm:mb-2 leading-relaxed">{trainer.experience}</p>
                  {trainer.certifications && (
                    <div className="flex flex-wrap gap-1">
                      {trainer.certifications.split(', ').map((cert, idx) => (
                        <span
                          key={idx}
                          className="bg-white/10 text-white/80 text-[9px] sm:text-[10px] lg:text-xs px-1.5 sm:px-2 py-0.5 rounded-full leading-relaxed"
                        >
                          {cert}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
