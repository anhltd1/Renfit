import React, { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react';
import { Bot, Loader2, Send } from 'lucide-react';
import { sendChatMessage } from '../../../lib/api/chat';
import type { ChatArtifact, ChatResponse } from '../../../lib/api/chat';
import { ChatArtifactCard } from './ChatArtifactCard';
import { SuggestedReplies } from './SuggestedReplies';
import type { ChatMessage } from './types';
import { TypingIndicator } from './TypingIndicator';
import { getAuthUser } from '../../../lib/auth';

/**
 * Lazy-loaded — react-markdown is only needed to render assistant replies,
 * not on initial chat-screen paint (U7 Performance & PWA, SPLIT-3). The
 * fallback renders the raw text unformatted so the message is never
 * invisible while the markdown renderer's chunk downloads.
 */
const ChatMessageContent = lazy(() =>
  import('./ChatMessageContent').then((m) => ({ default: m.ChatMessageContent })),
);

const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content:
    'Xin chào! Tôi là Renfit AI Coach. Bạn có thể hỏi về tập luyện, dinh dưỡng, tiến độ InBody, hoặc đặt lịch buổi tập nhé!',
};

/** Matches the backend's first-turn suggestions (services/ai/suggestions.py). */
const INITIAL_SUGGESTIONS = [
  'Tôi muốn đặt lịch',
  'Tôi muốn kiểm tra tiến độ',
  'Tôi muốn tư vấn lịch tập',
];

function mapResponseToMessage(res: ChatResponse, id: string): ChatMessage {
  return {
    id,
    role: 'assistant',
    content: res.message,
    artifact: res.artifact ?? null,
  };
}

interface ChatPanelProps {
  variant?: 'embedded' | 'full';
  showHeader?: boolean;
  className?: string;
}

export function ChatPanel({
  variant = 'embedded',
  showHeader = true,
  className = '',
}: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>(INITIAL_SUGGESTIONS);
  const scrollRef = useRef<HTMLDivElement>(null);
  const customerId = getAuthUser()?.id ?? null;

  const scrollToBottom = useCallback(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading, scrollToBottom]);

  const handleSend = async (override?: string) => {
    const text = (override ?? input).trim();
    if (!text || loading) return;

    setMessages((prev) => [
      ...prev,
      { id: `user-${Date.now()}`, role: 'user', content: text },
    ]);
    setInput('');
    setSuggestions([]);
    setLoading(true);
    setError(null);
    try {
      const res = await sendChatMessage({
        message: text,
        conversation_id: conversationId,
        customer_id: customerId,
      });
      setConversationId(res.conversation_id);
      setMessages((prev) => [
        ...prev,
        mapResponseToMessage(res, `assistant-${Date.now()}`),
      ]);
      setSuggestions(res.suggestions ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi.');
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (text: string) => {
    if (loading) return;
    void handleSend(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  /**
   * Called when a booking action (book/cancel) is triggered directly from an
   * artifact card. Appends a fresh assistant message confirming the result
   * so the conversation always ends with a clear confirmation, rather than
   * the slot just quietly disappearing from the availability card.
   */
  const handleArtifactBookingAction = (message: string, artifact: ChatArtifact) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: message,
        artifact,
      },
    ]);
    // Mirrors the backend's contextual suggestions for book_slot/cancel_booking
    // (services/ai/suggestions.py) since this action bypasses chat() entirely.
    setSuggestions(
      artifact.kind === 'booking_confirmation'
        ? ['Xem lịch tập sắp tới của tôi', 'Kiểm tra tiến độ InBody', 'Tôi muốn đặt lịch']
        : ['Đặt lại một lịch khác', 'Xem khung giờ còn trống', 'Tôi muốn đặt lịch'],
    );
  };

  const isFull = variant === 'full';

  return (
    <div
      className={`flex flex-col ${
        isFull ? 'h-full min-h-0 flex-1' : ''
      } ${className}`}
    >
      {showHeader && (
        <div className="bg-gradient-to-r from-[#0F6B3E] to-[#0F6B3E]/80 px-6 py-4 flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-white font-bold text-sm">Renfit AI Coach</h3>
            {loading && <span className="text-white/60 text-xs">Đang trả lời...</span>}
          </div>
        </div>
      )}

      <div
        ref={scrollRef}
        className={`p-4 md:p-6 space-y-4 ${
          isFull ? 'flex-1 min-h-0 overflow-y-auto' : 'max-h-[400px] overflow-y-auto'
        }`}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-5 py-4 ${
                msg.role === 'user'
                  ? 'bg-[#0F6B3E] text-white rounded-br-sm'
                  : 'bg-white/10 text-white border border-white/10 rounded-bl-sm'
              }`}
            >
              {msg.role === 'assistant' && (
                <div className="flex items-center gap-2 mb-2">
                  <Bot className="w-4 h-4 text-[#0F6B3E]" />
                  <span className="text-xs text-[#0F6B3E]">AI Coach</span>
                </div>
              )}
              {msg.role === 'assistant' ? (
                <Suspense fallback={<p className="whitespace-pre-line leading-relaxed text-sm">{msg.content}</p>}>
                  <ChatMessageContent content={msg.content} />
                </Suspense>
              ) : (
                <p className="whitespace-pre-line leading-relaxed text-sm">{msg.content}</p>
              )}

              {msg.artifact && (
                <ChatArtifactCard
                  artifact={msg.artifact}
                  customerId={customerId}
                  onBookingAction={handleArtifactBookingAction}
                />
              )}
            </div>
          </div>
        ))}

        {loading && <TypingIndicator />}
      </div>

      {error && (
        <p className="px-6 text-red-400 text-sm shrink-0">{error}</p>
      )}

      <div className="p-4 border-t border-white/10 shrink-0 space-y-3">
        {suggestions.length > 0 && !loading && (
          <SuggestedReplies suggestions={suggestions} onSelect={handleSuggestionClick} />
        )}
        <div className="flex gap-2 items-end">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Nhập câu hỏi của bạn..."
            disabled={loading}
            rows={1}
            className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder:text-white/40 resize-none outline-none focus:border-[#0F6B3E] transition-colors text-sm leading-relaxed max-h-24 disabled:opacity-50"
          />
          <button
            type="button"
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className="w-11 h-11 shrink-0 rounded-full bg-[#0F6B3E] hover:bg-[#0F6B3E]/90 disabled:opacity-50 flex items-center justify-center transition-all duration-300 hover:scale-105"
          >
            <Send className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
