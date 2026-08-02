import React from 'react';

interface SuggestedRepliesProps {
  suggestions: string[];
  onSelect: (text: string) => void;
}

/**
 * Clickable follow-up prompts shown above the chat input. Always exactly 3
 * (enforced server-side — see backend/src/services/ai/suggestions.py):
 * the first turn shows 3 fixed onboarding prompts (booking, progress,
 * consultation); every turn after that shows 2 contextual follow-ups plus
 * 1 fixed anchor, based on the last tool the agent called.
 */
export function SuggestedReplies({ suggestions, onSelect }: SuggestedRepliesProps) {
  if (suggestions.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {suggestions.map((text) => (
        <button
          key={text}
          type="button"
          onClick={() => onSelect(text)}
          className="px-4 py-2 bg-white/5 hover:bg-[#0F6B3E]/20 text-white/80 hover:text-white text-sm rounded-full border border-white/10 hover:border-[#0F6B3E]/50 transition-all duration-300"
        >
          {text}
        </button>
      ))}
    </div>
  );
}
