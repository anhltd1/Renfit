import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Tracks which section occupies the largest viewport share and whether
 * the page has scrolled past a threshold. Used by the Navigation bar to
 * show scroll state (transparent → glass) and active section highlighting.
 *
 * Degrades gracefully: if IntersectionObserver is unavailable, `activeId`
 * stays null and `isScrolled` still works via the scroll listener.
 */
export function useScrollSpy(sectionIds: string[]): {
  activeId: string | null;
  isScrolled: boolean;
} {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  // Mutable map: sectionId → visible ratio (updated by IO callbacks)
  const ratioMap = useRef<Map<string, number>>(new Map());
  const debounceRef = useRef<number | null>(null);
  const activeTimestamp = useRef<number>(0);

  // ── Scroll listener (for isScrolled state) ────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let ticking = false;
    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setIsScrolled(window.scrollY > 24);
        ticking = false;
      });
    };

    // Initial check
    setIsScrolled(window.scrollY > 24);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ── IntersectionObserver (for active section tracking) ─────────────────
  const updateActive = useCallback(() => {
    let largest: string | null = null;
    let largestRatio = 0;

    for (const [id, ratio] of ratioMap.current.entries()) {
      if (ratio >= 0.3 && ratio > largestRatio) {
        largestRatio = ratio;
        largest = id;
      }
    }

    // Debounce: require 100ms of stability before switching
    const now = performance.now();
    if (largest !== activeId) {
      if (now - activeTimestamp.current < 100) return;
      activeTimestamp.current = now;
    }

    setActiveId(largest);
  }, [activeId]);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.getAttribute('id');
          if (id) {
            ratioMap.current.set(id, entry.intersectionRatio);
          }
        }

        // Throttle updates to one per frame
        if (debounceRef.current !== null) cancelAnimationFrame(debounceRef.current);
        debounceRef.current = requestAnimationFrame(() => {
          updateActive();
        });
      },
      {
        threshold: [0, 0.1, 0.2, 0.3, 0.5, 0.7, 1.0],
      },
    );

    // Observe each section
    for (const id of sectionIds) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }

    return () => {
      observer.disconnect();
      if (debounceRef.current !== null) cancelAnimationFrame(debounceRef.current);
    };
  }, [sectionIds, updateActive]);

  return { activeId, isScrolled };
}
