/** Bell with zzz — "no notifications" empty state (U19). Static. */
export function BellSleep({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      {/* Bell shape */}
      <path
        d="M24 6 C18 6 14 10 14 16 L14 26 L10 30 L38 30 L34 26 L34 16 C34 10 30 6 24 6 Z"
        fill="#0F6B3E"
        opacity="0.3"
      />
      <path d="M20 30 C20 33 22 36 24 36 C26 36 28 33 28 30" stroke="#0F6B3E" strokeWidth="1.5" opacity="0.5" />
      {/* Zzz */}
      <text x="32" y="14" fontSize="8" fill="#0F6B3E" opacity="0.6" fontWeight="bold">z</text>
      <text x="35" y="10" fontSize="6" fill="#0F6B3E" opacity="0.4" fontWeight="bold">z</text>
      <text x="37" y="7" fontSize="5" fill="#0F6B3E" opacity="0.3" fontWeight="bold">z</text>
    </svg>
  );
}
