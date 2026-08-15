/**
 * TypingIndicator — 3-dot bounce animation for AI Coach "thinking" state (U19).
 * Replaces the spinner with a universally-recognized typing pattern.
 */
export function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-white/10 border border-white/10 rounded-2xl rounded-bl-sm px-5 py-4 flex items-center gap-1.5">
        <span className="typing-dot" style={{ animationDelay: '0ms' }} />
        <span className="typing-dot" style={{ animationDelay: '150ms' }} />
        <span className="typing-dot" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
}
