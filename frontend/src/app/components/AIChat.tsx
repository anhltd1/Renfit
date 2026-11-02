import { Bot, Sparkles } from 'lucide-react';
import { SectionAtmosphere } from './landing/SectionAtmosphere';
import { Card } from '../shared/primitives/Card';
import { cn } from '../shared/primitives/cn';
import { useInView } from '../shared/hooks/useInView';
import type { AiCoachContent } from '../../lib/api/siteContent';

interface AIChatProps {
  content?: AiCoachContent;
}

const DEFAULT_AI_COACH: AiCoachContent = {
  badge_text: 'AI-Powered',
  title: 'Trợ Lý AI Fitness Coach',
  subtitle:
    'Chat với AI Coach thông minh để nhận tư vấn tập luyện, dinh dưỡng và đặt lịch hẹn mọi lúc, mọi nơi.',
  messages: [
    {
      type: 'user',
      message: 'Chào bạn! Tôi muốn tăng cơ. Bạn có thể tư vấn cho tôi không?',
    },
    {
      type: 'ai',
      message:
        'Chào bạn! Tất nhiên rồi. Để tư vấn chính xác, tôi cần biết thêm một số thông tin: Bạn đã tập gym được bao lâu? Mục tiêu cụ thể của bạn là tăng bao nhiêu kg cơ?',
    },
    {
      type: 'user',
      message: 'Tôi mới bắt đầu. Muốn tăng 5kg cơ trong 3 tháng.',
    },
    {
      type: 'ai',
      message:
        'Tuyệt vời! Đây là kế hoạch dành cho bạn:\n\n✓ Tập 4-5 buổi/tuần với trọng tâm compound exercises\n✓ Protein 2g/kg cân nặng mỗi ngày\n✓ Thặng dư calories 300-500 kcal\n\nBạn có muốn đặt lịch với HLV để hướng dẫn chi tiết không?',
    },
  ],
};

export function AIChat({ content }: AIChatProps) {
  const { ref, isRevealed } = useInView<HTMLElement>();
  const data = content ?? DEFAULT_AI_COACH;

  // Split title for emerald highlight — "Trợ Lý" white, "AI Fitness Coach" emerald
  const titleParts = data.title.split(' ');
  const titleFirst = titleParts.slice(0, 2).join(' ');
  const titleRest = titleParts.slice(2).join(' ');

  return (
    <section className="relative py-12 sm:py-16 lg:py-24 px-4 sm:px-6 bg-[#0B0B0B] overflow-hidden" ref={ref}>
      <SectionAtmosphere glows={2} positions={[{ x: 25, y: 30 }, { x: 75, y: 60 }]} />

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className={cn(
          'text-center mb-8 sm:mb-16 opacity-0 translate-y-2',
          isRevealed && 'animate-fade-up',
        )}>
          <div className="inline-flex items-center gap-2 bg-[#0F6B3E]/20 px-4 sm:px-6 py-2 sm:py-3 rounded-full mb-4 sm:mb-6 border border-[#0F6B3E]/30">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-[#0F6B3E]" />
            <span className="text-[#0F6B3E] text-sm sm:text-base leading-relaxed">{data.badge_text}</span>
          </div>
          <h2 className="text-xl sm:text-3xl lg:text-5xl font-bold text-white mb-4 sm:mb-6 leading-relaxed">
            {titleFirst}{titleRest ? ' ' : ''}<span className="text-[#0F6B3E]">{titleRest}</span>
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-white/70 max-w-2xl mx-auto leading-relaxed">
            {data.subtitle}
          </p>
        </div>

        <div className={cn(
          'max-w-4xl mx-auto opacity-0 translate-y-2',
          isRevealed && 'animate-fade-up',
        )} style={{ '--stagger': 2 } as React.CSSProperties}>
          <Card tier="elevated" className="overflow-hidden p-0 shadow-[0_0_50px_rgba(15,107,62,0.2)]">
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-[#0F6B3E] to-[#0F6B3E]/80 px-4 sm:px-6 py-3 sm:py-4 flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold text-sm sm:text-base leading-relaxed">Renfit AI Coach</h3>
                <span className="text-white/60 text-xs sm:text-sm leading-relaxed">Tư vấn tập luyện & đặt lịch</span>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
              {data.messages.map((msg, index) => (
                <div
                  key={index}
                  className={cn('flex', msg.type === 'user' ? 'justify-end' : 'justify-start')}
                >
                  <div
                    className={cn(
                      'max-w-[85%] sm:max-w-[80%] rounded-2xl px-4 sm:px-6 py-3 sm:py-4',
                      msg.type === 'user'
                        ? 'bg-[#0F6B3E] text-white rounded-br-sm'
                        : 'bg-white/10 text-white border border-white/10 rounded-bl-sm',
                    )}
                  >
                    {msg.type === 'ai' && (
                      <div className="flex items-center gap-2 mb-2">
                        <Bot className="w-4 h-4 text-[#0F6B3E]" />
                        <span className="text-xs sm:text-sm text-[#0F6B3E] leading-relaxed">AI Coach</span>
                      </div>
                    )}
                    <p className="whitespace-pre-line leading-relaxed text-xs sm:text-sm">{msg.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
