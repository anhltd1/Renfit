import type { ChatArtifact } from '../../../lib/api/chat';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  artifact?: ChatArtifact | null;
}
