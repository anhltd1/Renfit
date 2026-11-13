import { Bot } from 'lucide-react';
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
        'Tuyệt vời! Đây là kế hoạch dành cho bạn:\n\n– Tập 4-5 buổi/tuần với trọng tâm compound exercises\n– Protein 2g/kg cân nặng mỗi ngày\n– Thặng dư calories 300-500 kcal\n\nBạn có muốn đặt lịch với HLV để hướng dẫn chi tiết không?',
    },
  ],
};

export function AIChat({ content }: AIChatProps) {
  const { ref, isRevealed } = useInView<HTMLElement>();
  const data = content ?? DEFAULT_AI_COACH;

  // DESIGN.md v2 marketing: the coach shown as a real piece of the app —
  // the same flat message style members see — beside the claim. No badge,
  // no gradient header. (`badge_text` stays editable in the CMS but is unused.)
  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-10" ref={ref}>
      <div className="max-w-7xl mx-auto grid gap-10 lg:gap-16 lg:grid-cols-12 items-start">
        <div className={cn('lg:col-span-5 opacity-0 translate-y-2', isRevealed && 'animate-fade-up')}>
          <h2 className="text-white font-bold leading-[1.15] text-[clamp(1.75rem,3.5vw,2.75rem)] max-w-[16ch]">{data.title}</h2>
          <p className="mt-5 text-white/80 text-base sm:text-lg leading-relaxed max-w-[42ch]">{data.subtitle}</p>
          <p className="mt-6 text-white/64 text-sm leading-relaxed max-w-[42ch]">
            Coach đọc được hồ sơ và kết quả InBody của bạn, và có thể giữ chỗ trong lịch khi bạn muốn.
          </p>
        </div>

        <div
          data-ui
          className={cn('lg:col-span-7 bg-surface border border-line rounded-panel overflow-hidden opacity-0 translate-y-2', isRevealed && 'animate-fade-up')}
          style={{ '--stagger': 2 } as React.CSSProperties}
        >
          <div className="px-5 py-3.5 border-b border-line flex items-baseline justify-between gap-3">
            <h3 className="text-white font-semibold text-base">AI Coach</h3>
            <span className="text-white/64 text-xs">trong ứng dụng hội viên</span>
          </div>
          <div className="p-5 sm:p-6 space-y-5">
            {data.messages.map((msg, index) => (
              <div key={index} className={cn('flex', msg.type === 'user' ? 'justify-end' : 'justify-start')}>
                {msg.type === 'user' ? (
                  <p className="max-w-[80%] rounded-panel rounded-br-md bg-primary text-white px-4 py-3 whitespace-pre-line leading-relaxed text-sm">
                    {msg.message}
                  </p>
                ) : (
                  <div className="max-w-[60ch]">
                    <p className="flex items-center gap-1.5 mb-1.5 text-xs text-white/64">
                      <Bot className="w-3.5 h-3.5" aria-hidden="true" /> AI Coach
                    </p>
                    <p className="whitespace-pre-line leading-relaxed text-sm text-white">{msg.message}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
