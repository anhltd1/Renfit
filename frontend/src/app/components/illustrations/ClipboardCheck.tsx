/** Clipboard with stroke-draw checkmark — "all caught up" empty state (U19). */
export function ClipboardCheck({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      {/* Clipboard body */}
      <rect x="12" y="8" width="24" height="32" rx="3" stroke="#0F6B3E" strokeWidth="2" opacity="0.5" />
      <rect x="18" y="5" width="12" height="6" rx="2" fill="#0F6B3E" opacity="0.6" />
      {/* Checkmark with stroke-draw */}
      <path
        d="M18 24 L22 28 L30 20"
        stroke="#0F6B3E"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="animate-stroke-draw"
      />
    </svg>
  );
}
