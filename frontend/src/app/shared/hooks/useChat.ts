import { useCallback } from 'react';
import { sendChatMessage, type ChatRequest, type ChatResponse } from '../../../lib/api/chat';

/**
 * AI Coach chat turn (U2 Shared Data Layer — wraps lib/api/chat.ts).
 * Message-list/conversation state stays in the component (ChatPanel today,
 * desktop/mobile chat screens later) — this hook only owns the network call,
 * matching the "thin service wrapper" scope of the other U2 hooks.
 */
export function useChat() {
  const send = useCallback((payload: ChatRequest): Promise<ChatResponse> => sendChatMessage(payload), []);
  return { send };
}
