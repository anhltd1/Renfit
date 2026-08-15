import { useEffect, useRef, useState } from 'react';

/**
 * useCountUp — animates a number from its previous value to the next one.
 *
 * Used for the small stat readouts (weight, body fat, counts) so numbers
 * arriving from the network settle into place instead of popping in. Plain
 * requestAnimationFrame, no animation library.
 *
 * Honours `prefers-reduced-motion` by snapping straight to the target — the
 * global CSS guard in theme.css cannot reach JS-driven values.
 *
 * @param value    target number (0/undefined-safe)
 * @param duration animation length in ms; defaults to the `base` motion token
 */
export function useCountUp(value: number, duration = 250): number {
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);

  useEffect(() => {
    const from = fromRef.current;
    const to = value;

    if (from === to) return;

    const reduced =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduced || duration <= 0) {
      fromRef.current = to;
      setDisplay(to);
      return;
    }

    let frame = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      // ease-out cubic — fast start, gentle settle, matches --motion-enter.
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(from + (to - from) * eased);
      if (t < 1) {
        frame = requestAnimationFrame(tick);
      } else {
        fromRef.current = to;
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, duration]);

  return display;
}
