/** Dumbbell with gentle CSS wobble — "no bookings today" empty state (U19). */
export function DumbbellWobble({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className="animate-wobble" aria-hidden="true">
      <rect x="8" y="18" width="4" height="12" rx="2" fill="#0F6B3E" opacity="0.7" />
      <rect x="12" y="20" width="4" height="8" rx="1" fill="#0F6B3E" opacity="0.5" />
      <rect x="16" y="22" width="16" height="4" rx="2" fill="#0F6B3E" opacity="0.8" />
      <rect x="32" y="20" width="4" height="8" rx="1" fill="#0F6B3E" opacity="0.5" />
      <rect x="36" y="18" width="4" height="12" rx="2" fill="#0F6B3E" opacity="0.7" />
    </svg>
  );
}
