import { cn } from '../../shared/primitives/cn';

export interface SectionAtmosphereProps {
  /** Number of emerald radial glows (1–3). Mobile renders at most 2. */
  glows?: 1 | 2 | 3;
  /** Position seeds for the glows as {x%, y%} pairs. */
  positions?: Array<{ x: number; y: number }>;
  /** Whether to render the subtle dot mask. Default: false. */
  mask?: boolean;
  className?: string;
}

const DEFAULT_POSITIONS: Array<{ x: number; y: number }> = [
  { x: 20, y: 30 },
  { x: 70, y: 60 },
  { x: 50, y: 20 },
];

/**
 * Decorative substrate rendered behind section content.
 *
 * Provides blurred emerald radial glows so that Glass_Tier surfaces above
 * have something to refract — making glassmorphism read as genuine depth
 * rather than a flat white-5% tint.
 *
 * Purely presentational: `aria-hidden`, no pointer events, no layout impact.
 */
export function SectionAtmosphere({
  glows = 2,
  positions = DEFAULT_POSITIONS,
  mask = false,
  className,
}: SectionAtmosphereProps) {
  const glowPositions = positions.slice(0, glows);

  return (
    <div
      aria-hidden="true"
      className={cn(
        'absolute inset-0 overflow-hidden pointer-events-none select-none',
        // Slow ambient drift — collapsed to 0.01ms by the reduced-motion media block in theme.css
        'motion-safe:animate-drift',
        className,
      )}
    >
      {glowPositions.map((pos, i) => (
        <div
          key={i}
          className={cn(
            'absolute rounded-full bg-[#0F6B3E]/10 blur-[80px]',
            // Size: 320–720px depending on index
            i === 0 ? 'w-[480px] h-[480px]' : i === 1 ? 'w-[400px] h-[400px]' : 'w-[320px] h-[320px]',
            // Hide 3rd glow on mobile (keeps ≤2 on Mobile_Viewport)
            i === 2 && 'hidden sm:block',
          )}
          style={{
            left: `${pos.x}%`,
            top: `${pos.y}%`,
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}

      {mask && (
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              'radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
      )}
    </div>
  );
}
