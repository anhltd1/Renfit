import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Bot, Loader2, Send } from 'lucide-react';
import { sendChatMessage } from '../../../lib/api/chat';
import type { ChatResponse } from '../../../lib/api/chat';
import { CustomerProfileForm } from './CustomerProfileForm';
import { BookingForm } from './BookingForm';
import { BookingIntakeForm } from './BookingIntakeForm';
import { ChatMessageContent } from './ChatMessageContent';
import { CustomerInfoForm } from './CustomerInfoForm';
import type {
  CustomerProfileFormData,
  BookingFormData,
  ChatMessage,
  CustomerFormData,
  IntakeFormData,
} from './types';
import { inferFormFromResponse, introForForm } from './formUtils';

const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content:
    'Xin chào! Tôi là Renfit AI Coach. Bạn có thể hỏi về tập luyện, dinh dưỡng, hoặc đặt lịch buổi tập nhé!',
};

function mapResponseToMessage(res: ChatResponse, id: string): ChatMessage {
  const form = inferFormFromResponse(res);
  const customerName =
    typeof res.metadata?.customer_name === 'string'
      ? res.metadata.customer_name
      : undefined;
  return {
    id,
    role: 'assistant',
    content: res.message,
    responseType: res.type,
    form,
    formIntro: form ? introForForm(res.message, form) : undefined,
    formCustomerName: customerName,
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
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading, scrollToBottom]);

  const processResponse = useCallback((res: ChatResponse) => {
    setConversationId(res.conversation_id);
    setMessages((prev) => [
      ...prev,
      mapResponseToMessage(res, `assistant-${Date.now()}`),
    ]);
  }, []);

  const sendToAgent = useCallback(
    async (text: string, formData?: Record<string, string>) => {
      setLoading(true);
      setError(null);
      try {
        const res = await sendChatMessage({
          message: text,
          conversation_id: conversationId,
          form_data: formData,
        });
        processResponse(res);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi.');
      } finally {
        setLoading(false);
      }
    },
    [conversationId, processResponse]
  );

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setMessages((prev) => [
      ...prev,
      { id: `user-${Date.now()}`, role: 'user', content: text },
    ]);
    setInput('');
    await sendToAgent(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const disableFormOnMessage = (messageId: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, formDisabled: true } : m))
    );
  };

  const handleCustomerFormSubmit = async (messageId: string, data: CustomerFormData) => {
    disableFormOnMessage(messageId);
    setMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        role: 'user',
        content: `Đã gửi thông tin: ${data.customer_name}`,
      },
    ]);
    await sendToAgent('Tôi đã gửi thông tin khách hàng qua biểu mẫu.', data);
  };

  const handleBookingFormSubmit = async (messageId: string, data: BookingFormData) => {
    disableFormOnMessage(messageId);
    setMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        role: 'user',
        content: `Đặt lịch: ${data.customer_name} — ${data.date} ${data.time}`,
      },
    ]);
    await sendToAgent('Tôi đã gửi thông tin đặt lịch qua biểu mẫu.', data);
  };

  const handleCustomerProfileSubmit = async (
    messageId: string,
    data: CustomerProfileFormData
  ) => {
    disableFormOnMessage(messageId);
    setMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        role: 'user',
        content: `Đã gửi hồ sơ: ${data.customer_name}`,
      },
    ]);
    await sendToAgent(
      'Tôi đã gửi thông tin cá nhân (chiều cao, cân nặng, mục tiêu) qua biểu mẫu.',
      data
    );
  };

  const handleIntakeFormSubmit = async (messageId: string, data: IntakeFormData) => {
    disableFormOnMessage(messageId);
    setMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        role: 'user',
        content: `Đặt lịch: ${data.customer_name} — ${data.date} ${data.time}`,
      },
    ]);
    await sendToAgent(
      'Tôi đã gửi đầy đủ thông tin đặt lịch (tên, SĐT, ngày giờ) qua biểu mẫu.',
      data
    );
  };

  const isFull = variant === 'full';

  const hasActiveForm = messages.some(
    (m) => m.role === 'assistant' && m.form && !m.formDisabled
  );

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
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-white/80 text-xs">
                {loading ? 'Đang trả lời...' : 'Đang hoạt động'}
              </span>
            </div>
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
                msg.form && !msg.formDisabled ? (
                  <p className="text-sm leading-relaxed text-white/95 mb-1">
                    {msg.formIntro ?? introForForm(msg.content, msg.form)}
                  </p>
                ) : (
                  <ChatMessageContent content={msg.content} />
                )
              ) : (
                <p className="whitespace-pre-line leading-relaxed text-sm">{msg.content}</p>
              )}

              {msg.responseType === 'customer_saved' && (
                <p className="mt-2 text-xs text-green-400">✓ Đã lưu thông tin khách hàng</p>
              )}
              {msg.responseType === 'booking_success' && (
                <p className="mt-2 text-xs text-green-400">✓ Đã tạo lịch đặt buổi tập</p>
              )}

              {msg.form === 'intake' && !msg.formDisabled && (
                <BookingIntakeForm
                  disabled={loading}
                  onSubmit={(data) => handleIntakeFormSubmit(msg.id, data)}
                />
              )}
              {msg.form === 'customer' && !msg.formDisabled && (
                <CustomerInfoForm
                  disabled={loading}
                  onSubmit={(data) => handleCustomerFormSubmit(msg.id, data)}
                />
              )}
              {msg.form === 'booking' && !msg.formDisabled && (
                <BookingForm
                  disabled={loading}
                  onSubmit={(data) => handleBookingFormSubmit(msg.id, data)}
                />
              )}
              {(msg.form === 'customer_profile' || msg.form === 'body_metrics') &&
                !msg.formDisabled && (
                <CustomerProfileForm
                  defaultCustomerName={msg.formCustomerName}
                  disabled={loading}
                  onSubmit={(data) => handleCustomerProfileSubmit(msg.id, data)}
                />
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white/10 border border-white/10 rounded-2xl px-5 py-3 flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-[#0F6B3E] animate-spin" />
              <span className="text-white/60 text-sm">AI đang suy nghĩ...</span>
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="px-6 text-red-400 text-sm shrink-0">{error}</p>
      )}

      <div className="p-4 border-t border-white/10 shrink-0">
        {hasActiveForm ? (
          <p className="text-center text-white/50 text-sm py-2">
            Điền thông tin trong tin nhắn AI phía trên ↑
          </p>
        ) : (
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
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="w-11 h-11 shrink-0 rounded-full bg-[#0F6B3E] hover:bg-[#0F6B3E]/90 disabled:opacity-50 flex items-center justify-center transition-all duration-300 hover:scale-105"
          >
            <Send className="w-5 h-5 text-white" />
          </button>
        </div>
        )}
      </div>
    </div>
  );
}
