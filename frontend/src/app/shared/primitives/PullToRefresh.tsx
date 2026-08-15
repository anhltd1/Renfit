/**
 * PullToRefresh — mobile overscroll pull gesture wrapper (U10 Polish).
 * Detects a downward pull when scrolled to top, shows a spinner, calls onRefresh.
 */
import { useCallback, useRef, useState, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

const THRESHOLD = 60; // px to trigger refresh

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: ReactNode;
  className?: string;
}

export function PullToRefresh({ onRefresh, children, className = '' }: PullToRefreshProps) {
  const [pulling, setPulling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [pullY, setPullY] = useState(0);
  const startY = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (scrollRef.current && scrollRef.current.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
      setPulling(true);
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!pulling || refreshing) return;
    const diff = e.touches[0].clientY - startY.current;
    if (diff > 0) {
      setPullY(Math.min(diff * 0.4, THRESHOLD * 1.5));
    }
  }, [pulling, refreshing]);

  const handleTouchEnd = useCallback(async () => {
    if (!pulling) return;
    if (pullY >= THRESHOLD && !refreshing) {
      setRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setRefreshing(false);
      }
    }
    setPulling(false);
    setPullY(0);
  }, [pulling, pullY, refreshing, onRefresh]);

  return (
    <div
      ref={scrollRef}
      className={`flex-1 overflow-y-auto relative ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      {(pullY > 0 || refreshing) && (
        <div
          className="flex items-center justify-center transition-all"
          style={{ height: refreshing ? THRESHOLD * 0.6 : pullY }}
        >
          <Loader2
            className={`w-5 h-5 text-[#0F6B3E] transition-transform ${
              refreshing ? 'animate-ptr-spin' : ''
            }`}
            style={{ transform: refreshing ? undefined : `rotate(${pullY * 3}deg)` }}
          />
        </div>
      )}
      {children}
    </div>
  );
}
