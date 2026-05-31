import React from 'react';
import { Link } from './Link';
import { Bot, Send, Sparkles } from 'lucide-react';

const chatMessages = [
  {
    type: 'user' as const,
    message: 'Chào bạn! Tôi muốn tăng cơ. Bạn có thể tư vấn cho tôi không?',
  },
  {
    type: 'ai' as const,
    message:
      'Chào bạn! Tất nhiên rồi. Để tư vấn chính xác, tôi cần biết thêm một số thông tin: Bạn đã tập gym được bao lâu? Mục tiêu cụ thể của bạn là tăng bao nhiêu kg cơ?',
  },
  {
    type: 'user' as const,
    message: 'Tôi mới bắt đầu. Muốn tăng 5kg cơ trong 3 tháng.',
  },
  {
    type: 'ai' as const,
    message:
      'Tuyệt vời! Đây là kế hoạch dành cho bạn:\n\n✓ Tập 4-5 buổi/tuần với trọng tâm compound exercises\n✓ Protein 2g/kg cân nặng mỗi ngày\n✓ Thặng dư calories 300-500 kcal\n\nBạn có muốn đặt lịch với HLV để hướng dẫn chi tiết không?',
  },
];

export function AIChat() {
  return (
    <section className="py-24 px-6 bg-black relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#0F6B3E]/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#0F6B3E]/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-[#0F6B3E]/20 px-6 py-3 rounded-full mb-6 border border-[#0F6B3E]/30">
            <Sparkles className="w-5 h-5 text-[#0F6B3E]" />
            <span className="text-[#0F6B3E]">AI-Powered</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Trợ Lý <span className="text-[#0F6B3E]">AI Fitness Coach</span>
          </h2>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Chat với AI Coach thông minh để nhận tư vấn tập luyện,
            dinh dưỡng và đặt lịch hẹn mọi lúc, mọi nơi.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden shadow-[0_0_50px_rgba(15,107,62,0.2)]">
            <div className="bg-gradient-to-r from-[#0F6B3E] to-[#0F6B3E]/80 px-6 py-4 flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold">Renfit AI Coach</h3>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-white/80 text-sm">Đang hoạt động</span>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4 max-h-[500px] overflow-y-auto">
              {chatMessages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-6 py-4 ${
                      msg.type === 'user'
                        ? 'bg-[#0F6B3E] text-white rounded-br-sm'
                        : 'bg-white/10 text-white border border-white/10 rounded-bl-sm'
                    }`}
                  >
                    {msg.type === 'ai' && (
                      <div className="flex items-center gap-2 mb-2">
                        <Bot className="w-4 h-4 text-[#0F6B3E]" />
                        <span className="text-sm text-[#0F6B3E]">AI Coach</span>
                      </div>
                    )}
                    <p className="whitespace-pre-line leading-relaxed">{msg.message}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 border-t border-white/10 flex justify-center">
              <Link
                to="/ai-coach"
                className="inline-flex items-center gap-2 bg-[#0F6B3E] hover:bg-[#0F6B3E]/90 text-white font-semibold px-8 py-3 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(15,107,62,0.5)]"
              >
                Chat với AI coach ngay
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-[#0F6B3E]/20 flex items-center justify-center mx-auto mb-3">
                <Bot className="w-6 h-6 text-[#0F6B3E]" />
              </div>
              <h4 className="text-white font-bold mb-2">Trả Lời Ngay Lập Tức</h4>
              <p className="text-white/60 text-sm">Nhận câu trả lời trong vài giây</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-[#0F6B3E]/20 flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-6 h-6 text-[#0F6B3E]" />
              </div>
              <h4 className="text-white font-bold mb-2">Tư Vấn Cá Nhân</h4>
              <p className="text-white/60 text-sm">Dựa trên mục tiêu của bạn</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-[#0F6B3E]/20 flex items-center justify-center mx-auto mb-3">
                <Send className="w-6 h-6 text-[#0F6B3E]" />
              </div>
              <h4 className="text-white font-bold mb-2">Đặt Lịch Dễ Dàng</h4>
              <p className="text-white/60 text-sm">Chat và đặt hẹn với HLV</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
