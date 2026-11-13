/**
 * Recharts X-axis tick that renders the date label and, directly under it,
 * a small thumbnail of that measurement's photos (cover + "+N" badge).
 * Because it *is* the axis tick, the thumbnail is always aligned with its
 * date column. Tapping it calls `onOpen(index)` — callers open PhotoLightbox.
 */
import { resolveApiAsset } from '../../lib/api/profile';

/** Extra axis height needed below the date label when any record has photos. */
export const PHOTO_TICK_EXTRA = 48;

export interface InbodyPhotoTickProps {
  /** Injected by recharts. */
  x?: number;
  y?: number;
  index?: number;
  /** Date label per data index ('' for padding columns). */
  labels: string[];
  /** Photo URLs per data index. */
  photos: (string[] | undefined)[];
  onOpen: (index: number) => void;
  /** Thumbnail edge in px. */
  size?: number;
  fontSize?: number;
}

export function InbodyPhotoTick({
  x = 0,
  y = 0,
  index = 0,
  labels,
  photos,
  onOpen,
  size = 36,
  fontSize = 11,
}: InbodyPhotoTickProps) {
  const label = labels[index] ?? '';
  const list = photos[index] ?? [];
  const cover = list[0];
  const extra = list.length - 1;

  return (
    <g>
      {label && (
        <text
          x={x}
          y={y + 12}
          textAnchor="middle"
          fill="rgba(255,255,255,0.45)"
          fontSize={fontSize}
          fontWeight={500}
          fontFamily="inherit"
        >
          {label}
        </text>
      )}
      {cover && (
        <foreignObject x={x - size / 2} y={y + 20} width={size} height={size} style={{ overflow: 'visible' }}>
          <button
            type="button"
            onClick={() => onOpen(index)}
            data-testid="inbody-photo-thumb"
            aria-label={`Xem ${list.length} ảnh ngày ${label}`}
            title={`${list.length} ảnh · nhấn để xem`}
            className="relative block rounded-lg overflow-hidden border border-white/20 hover:border-[#0F6B3E] bg-white/5 transition-[border-color,transform] duration-[var(--motion-fast)] active:scale-[0.95] focus-visible:ring-2 focus-visible:ring-primary-text"
            style={{ width: size, height: size, padding: 0 }}
          >
            <img
              src={resolveApiAsset(cover)}
              alt=""
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover"
              draggable={false}
            />
            {extra > 0 && (
              <span className="absolute bottom-0 right-0 rounded-tl-md bg-black/75 px-1 text-white text-xs font-semibold leading-tight">
                +{extra}
              </span>
            )}
          </button>
        </foreignObject>
      )}
    </g>
  );
}
