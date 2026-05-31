import React, { useState } from 'react';
import { Link } from '../components/Link';
import { ChatPanel } from '../components/chat/ChatPanel';
import { Bot, Plus, Sparkles } from 'lucide-react';

const conversationHistory = [
  { id: 1, title: 'Tư vấn giảm cân', date: 'Hôm nay' },
  { id: 2, title: 'Chương trình tăng cơ', date: 'Hôm qua' },
  { id: 3, title: 'Tư vấn dinh dưỡng', date: '2 ngày trước' },
];

export function AIChatPage() {
  const [chatKey, setChatKey] = useState(0);

  return (
    <div className="h-[100dvh] w-full flex overflow-hidden bg-[#0B0B0B] text-white">
      {/* Sidebar */}
      <aside className="w-72 shrink-0 hidden md:flex flex-col bg-black border-r border-white/10">
        <div className="p-6 border-b border-white/10">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#0F6B3E]/30 flex items-center justify-center">
              <Bot className="w-5 h-5 text-[#0F6B3E]" />
            </div>
            <span className="font-bold text-white">Renfit</span>
          </Link>
        </div>

        <div className="p-4">
          <button
            type="button"
            className="w-full bg-[#0F6B3E] hover:bg-[#0F6B3E]/90 text-white py-3 rounded-2xl flex items-center justify-center gap-2 transition-all duration-300"
            onClick={() => setChatKey((k) => k + 1)}
          >
            <Plus className="w-5 h-5" />
            Cuộc Trò Chuyện Mới
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 min-h-0">
          <h3 className="text-white/60 text-sm mb-3">Lịch sử</h3>
          <div className="space-y-2">
            {conversationHistory.map((conv) => (
              <button
                key={conv.id}
                type="button"
                className="w-full text-left bg-white/5 hover:bg-white/10 rounded-xl p-3 border border-white/10 transition-colors"
              >
                <div className="text-white text-sm mb-1">{conv.title}</div>
                <div className="text-white/40 text-xs">{conv.date}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-white/10">
          <Link
            to="/"
            className="w-full flex items-center justify-center bg-white/5 hover:bg-[#0F6B3E]/20 border border-white/10 hover:border-[#0F6B3E] text-white hover:text-[#0F6B3E] py-3 rounded-2xl transition-all duration-300"
          >
            Trở về trang chủ
          </Link>
        </div>
      </aside>

      {/* Main chat */}
      <main className="flex-1 flex flex-col min-w-0 min-h-0">
        <header className="shrink-0 bg-black/80 backdrop-blur-md border-b border-white/10 px-4 md:px-8 py-4">
          <div className="flex items-center gap-3">
            <Link to="/" className="md:hidden text-white/60 text-sm hover:text-[#0F6B3E]">
              ← Trang chủ
            </Link>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0F6B3E] to-[#0F6B3E]/60 flex items-center justify-center shrink-0">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg md:text-xl font-bold text-white truncate">
                Renfit AI Coach
              </h1>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-white/60 text-sm">Đang hoạt động</span>
              </div>
            </div>
            <div className="ml-auto hidden sm:flex items-center gap-2 bg-[#0F6B3E]/20 px-4 py-2 rounded-full border border-[#0F6B3E]/30">
              <Sparkles className="w-4 h-4 text-[#0F6B3E]" />
              <span className="text-[#0F6B3E] text-sm">AI-Powered</span>
            </div>
          </div>
        </header>

        <div className="flex-1 min-h-0 flex flex-col">
          <ChatPanel key={chatKey} variant="full" showHeader={false} />
        </div>
      </main>
    </div>
  );
}
