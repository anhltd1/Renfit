/** Person stretching — "no InBody data" empty state (U19). Static. */
export function PersonStretching({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      {/* Head */}
      <circle cx="24" cy="10" r="4" fill="#0F6B3E" opacity="0.7" />
      {/* Body */}
      <path d="M24 14 L24 28" stroke="#0F6B3E" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      {/* Arms stretched */}
      <path d="M24 18 L16 14" stroke="#0F6B3E" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      <path d="M24 18 L32 14" stroke="#0F6B3E" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      {/* Legs */}
      <path d="M24 28 L18 38" stroke="#0F6B3E" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      <path d="M24 28 L30 38" stroke="#0F6B3E" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}
