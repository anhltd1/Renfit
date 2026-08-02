/**
 * Mobile AI Coach screen (U4 Trainee Mobile, TS-5).
 * Full-screen ChatPanel with a StackHeader — reuses the chat panel as-is
 * (it already renders artifacts/suggestions responsively); the "new chat"
 * action moves from the desktop sidebar into the header's right slot.
 */
import { Plus } from 'lucide-react';
import { ChatPanel } from '../../components/chat/ChatPanel';
import { StackHeader } from '../shell/StackHeader';

export interface CoachScreenProps {
  chatKey: number;
  onNewChat: () => void;
}

export function CoachScreen({ chatKey, onNewChat }: CoachScreenProps) {
  return (
    <div className="flex flex-col min-h-0 flex-1">
      <StackHeader
        title="Renfit AI Coach"
        right={
          <button
            type="button"
            data-testid="coach-new-chat-button"
            onClick={onNewChat}
            aria-label="Cuộc trò chuyện mới"
            className="w-9 h-9 rounded-xl text-[#0F6B3E] hover:bg-[#0F6B3E]/10 flex items-center justify-center transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        }
      />
      <ChatPanel key={chatKey} variant="full" showHeader={false} className="flex-1 min-h-0" />
    </div>
  );
}
