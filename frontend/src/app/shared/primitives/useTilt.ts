/**
 * useTilt — subtle 3D tilt on mouse position for glass cards (U19).
 * Desktop only (pointer: fine). Returns ref + style to apply on the element.
 */
import { useCallback, useRef, useState } from 'react';

const MAX_TILT = 2; // degrees

export function useTilt() {
  const ref = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<React.CSSProperties>({});

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    // Only on fine-pointer devices
    if (!window.matchMedia('(pointer: fine)').matches) return;

    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    setStyle({
      transform: `perspective(600px) rotateX(${-y * MAX_TILT}deg) rotateY(${x * MAX_TILT}deg)`,
      transition: 'transform 0.1s ease-out',
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setStyle({
      transform: 'perspective(600px) rotateX(0deg) rotateY(0deg)',
      transition: 'transform 0.3s ease-out',
    });
  }, []);

  return { ref, style, onMouseMove: handleMouseMove, onMouseLeave: handleMouseLeave };
}
