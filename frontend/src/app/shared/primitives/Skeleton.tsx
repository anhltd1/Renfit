/**
 * Skeleton — shimmer placeholder for loading states (U10 Polish).
 * Usage: <Skeleton className="h-4 w-32" /> or <Skeleton className="h-12 w-full rounded-xl" />
 */
export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`bg-white/[0.06] rounded-lg animate-pulse ${className}`}
      aria-hidden="true"
    />
  );
}
