/**
 * useCountUp — animates a number from 0 to target over duration (U18).
 * Uses requestAnimationFrame for smooth 60fps interpolation.
 */
import { useEffect, useRef, useState } from 'react';

export function useCountUp(target: number, duration = 400): number {
  const [value, setValue] = useState(0);
  const startTime = useRef<number | null>(null);
  const rafId = useRef(0);

  useEffect(() => {
    if (target === 0) { setValue(0); return; }

    startTime.current = null;
    const animate = (timestamp: number) => {
      if (startTime.current === null) startTime.current = timestamp;
      const elapsed = timestamp - startTime.current;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out quad
      const eased = 1 - (1 - progress) * (1 - progress);
      setValue(eased * target);
      if (progress < 1) {
        rafId.current = requestAnimationFrame(animate);
      }
    };

    rafId.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId.current);
  }, [target, duration]);

  return value;
}
