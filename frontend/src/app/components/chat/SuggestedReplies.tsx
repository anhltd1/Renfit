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
          className="px-3.5 py-2 bg-surface hover:bg-surface-2 text-white/80 hover:text-white text-sm rounded-control border border-line-strong transition-colors text-left"
        >
          {text}
        </button>
      ))}
    </div>
  );
}
