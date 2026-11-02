import { useRef, useState, useEffect, useCallback } from 'react';

export interface UseInViewOptions {
  /** IntersectionObserver threshold (0–1). Default: 0.15. */
  threshold?: number;
  /** Whether the hook should observe at all. Default: true. */
  enabled?: boolean;
}

/**
 * Scroll-triggered reveal hook.
 *
 * Reports an element as "revealed" when at least `threshold` of its area
 * intersects the viewport. Fires at most once per page load. Respects
 * `prefers-reduced-motion: reduce` and degrades safely when
 * `IntersectionObserver` or `window` is unavailable (SSR/jsdom).
 *
 * Used exclusively on the marketing landing page per the design-system
 * steering amendment (scroll reveals forbidden on authenticated surfaces).
 */
export function useInView<T extends HTMLElement = HTMLElement>(
  options?: UseInViewOptions,
): { ref: (node: T | null) => void; isRevealed: boolean } {
  const { threshold = 0.15, enabled = true } = options ?? {};

  const shouldSkip = () => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return true;
    if (typeof IntersectionObserver === 'undefined') return true;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return true;
    if (!enabled) return true;
    return false;
  };

  const [isRevealed, setIsRevealed] = useState(shouldSkip);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const nodeRef = useRef<T | null>(null);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
  }, []);

  // Callback ref: called when the DOM node mounts/unmounts
  const ref = useCallback(
    (node: T | null) => {
      // Unobserve previous node
      if (nodeRef.current && observerRef.current) {
        observerRef.current.unobserve(nodeRef.current);
      }
      nodeRef.current = node;

      // If already revealed or should skip, nothing to do
      if (isRevealed || shouldSkip()) {
        if (!isRevealed) setIsRevealed(true);
        return;
      }

      if (!node) return;

      // Create observer if needed
      if (!observerRef.current) {
        observerRef.current = new IntersectionObserver(
          (entries) => {
            for (const entry of entries) {
              if (entry.isIntersecting) {
                setIsRevealed(true);
                observerRef.current?.unobserve(entry.target);
                break;
              }
            }
          },
          { threshold },
        );
      }

      observerRef.current.observe(node);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [threshold, enabled, isRevealed],
  );

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return { ref, isRevealed };
}
