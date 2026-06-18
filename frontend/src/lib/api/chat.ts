const API_BASE = import.meta.env.VITE_API_URL ?? '';

export type ChatResponseType =
  | 'text'
  | 'form_request'
  | 'booking_success'
  | 'customer_saved';

export interface ChatResponse {
  conversation_id: string;
  type: ChatResponseType;
  message: string;
  form?: 'customer' | 'booking' | 'intake' | null;
  fields?: string[] | null;
  metadata?: Record<string, unknown>;
}

export interface ChatRequest {
  message: string;
  conversation_id?: string | null;
  form_data?: Record<string, string>;
}

export async function sendChatMessage(payload: ChatRequest): Promise<ChatResponse> {
  const url = API_BASE ? `${API_BASE}/chat` : '/chat';
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: payload.message,
      conversation_id: payload.conversation_id ?? null,
      form_data: payload.form_data ?? {},
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { detail?: unknown };
    if (typeof err.detail === 'string') throw new Error(err.detail);
    throw new Error('Không thể kết nối AI Coach. Vui lòng thử lại.');
  }

  return res.json();
}
