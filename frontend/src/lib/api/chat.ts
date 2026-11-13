import { memberFetch } from './memberFetch';

const API_BASE = import.meta.env.VITE_API_URL ?? '';

export type ArtifactKind =
  | 'profile'
  | 'inbody_progress'
  | 'booking_availability'
  | 'booking_confirmation'
  | 'booking_cancelled';

/**
 * Structured, read-only UI panel rendered from a tool result. Artifacts are
 * generated server-side from deterministic data — the AI cannot fabricate
 * one, and no artifact is ever a data-entry form. Editing personal info
 * happens on the Profile page, not in chat.
 */
export interface ChatArtifact {
  kind: ArtifactKind;
  title: string;
  data: Record<string, any>;
}

export interface ChatResponse {
  conversation_id: string;
  message: string;
  artifact?: ChatArtifact | null;
  /** Always exactly 3 clickable follow-up prompts for the chat input. */
  suggestions?: string[];
  metadata?: Record<string, unknown>;
}

export interface ChatRequest {
  message: string;
  conversation_id?: string | null;
  customer_id?: string | null;
}

export async function sendChatMessage(payload: ChatRequest): Promise<ChatResponse> {
  const url = API_BASE ? `${API_BASE}/chat` : '/chat';
  const res = await memberFetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: payload.message,
      conversation_id: payload.conversation_id ?? null,
      customer_id: payload.customer_id ?? null,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { detail?: unknown };
    if (typeof err.detail === 'string') throw new Error(err.detail);
    throw new Error('Không thể kết nối AI Coach. Vui lòng thử lại.');
  }

  return res.json();
}
