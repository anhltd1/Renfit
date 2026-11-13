/**
 * Member home building blocks (DESIGN.md v2), shared by the desktop and
 * mobile member home screens. Each block answers one question:
 *   NextSessionPanel  — "Khi nào tôi tập buổi tới?" (the screen's question)
 *   OpenSlotsList     — "Còn chỗ lúc nào?" (capacity marks, the signature)
 *   InbodyFigures     — "Tôi đã thay đổi thế nào?" (deltas with a baseline)
 *   WeightTrend       — the weight line behind those figures
 */
import { ChevronRight } from 'lucide-react';
import { CapacityMarks } from '../booking/CapacityMarks';
import { StatusBadge } from '../booking/StatusBadge';
import { cn } from '../primitives/cn';
import {
  countdownLabel,
  formatSigned,
  formatVi,
  type InbodySummary,
  type NextSession,
  type OpenSlot,
} from './memberHomeModel';

const panel = 'bg-surface border border-line rounded-panel';

export function PanelHeader({ title, meta, action }: { title: string; meta?: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3 mb-4">
      <div className="flex items-baseline gap-2 min-w-0">
        <h2 className="text-white text-base font-semibold leading-tight">{title}</h2>
        {meta && <span className="text-white/64 text-xs tabular-nums truncate">{meta}</span>}
      </div>
      {action}
    </div>
  );
}

export interface NextSessionPanelProps {
  next: NextSession | null;
  now: Date;
  onOpenBookings: () => void;
  className?: string;
}

export function NextSessionPanel({ next, now, onOpenBookings, className }: NextSessionPanelProps) {
  if (!next) {
    return (
      <section className={cn(panel, 'p-5 sm:p-6 flex flex-col', className)} data-testid="next-session-empty">
        <p className="text-white/64 text-[13px] font-medium">Buổi tập tiếp theo</p>
        <p className="text-white text-2xl sm:text-[32px] font-semibold leading-tight mt-2">Chưa có buổi nào</p>
        <p className="text-white/64 text-sm leading-relaxed mt-2 max-w-sm">
          Mỗi khung giờ tối đa 4 người — đặt sớm để giữ giờ bạn muốn.
        </p>
        <div className="mt-5 sm:mt-auto sm:pt-6">
          <button
            type="button"
            onClick={onOpenBookings}
            className="inline-flex items-center justify-center rounded-full bg-primary hover:bg-primary-hover text-white text-sm font-semibold px-5 py-2.5 active:scale-[0.97] transition-colors"
          >
            Đặt lịch tập
          </button>
        </div>
      </section>
    );
  }

  const others = Math.max(0, next.taken - 1);
  return (
    <section className={cn(panel, 'p-5 sm:p-6 flex flex-col', className)} data-testid="next-session">
      <div className="flex items-center justify-between gap-3">
        <p className="text-white/64 text-[13px] font-medium">Buổi tập tiếp theo</p>
        <StatusBadge status={next.status} />
      </div>
      <p className="mt-2 leading-none tabular-nums">
        <span className="text-white text-[40px] sm:text-5xl font-semibold tracking-tight">{next.time}</span>
        <span className="text-white/80 text-lg sm:text-xl font-medium ml-3">{next.day}</span>
      </p>
      <p className="text-primary-text text-sm font-medium mt-3 tabular-nums">{countdownLabel(next.startsAt, now)}</p>

      <div className="mt-5 sm:mt-auto sm:pt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
        <span className="inline-flex items-center gap-2.5 text-sm text-white/80">
          <CapacityMarks taken={next.taken} capacity={next.capacity} mine />
          <span className="tabular-nums">
            {others === 0 ? 'Chỉ có bạn trong khung giờ này' : `Bạn và ${others} người khác`}
          </span>
        </span>
        <button
          type="button"
          onClick={onOpenBookings}
          className="inline-flex items-center gap-1 text-sm text-white/80 hover:text-white rounded-control px-2 py-1 -mr-2 hover:bg-surface-2 transition-colors"
        >
          Xem lịch <ChevronRight className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}

export interface OpenSlotsListProps {
  slots: OpenSlot[];
  onPick: (slot: OpenSlot) => void;
  onViewAll: () => void;
  className?: string;
}

export function OpenSlotsList({ slots, onPick, onViewAll, className }: OpenSlotsListProps) {
  return (
    <section className={cn(panel, 'p-5 sm:p-6', className)} data-testid="open-slots">
      <PanelHeader
        title="Giờ còn chỗ"
        meta="hôm nay và sắp tới"
        action={
          <button type="button" onClick={onViewAll} className="text-sm text-white/64 hover:text-white transition-colors shrink-0">
            Xem tất cả
          </button>
        }
      />
      {slots.length === 0 ? (
        <p className="text-white/64 text-sm leading-relaxed py-3">Các khung giờ sắp tới đều đã kín. Xem lịch cả tuần để chọn ngày khác.</p>
      ) : (
        <ul className="-mx-2 divide-y divide-line">
          {slots.map((s) => (
            <li key={`${s.date}-${s.hour}`}>
              <button
                type="button"
                onClick={() => onPick(s)}
                aria-label={`${s.isToday ? 'Hôm nay' : s.day} ${s.time}, còn ${s.capacity - s.taken} chỗ`}
                className="w-full flex items-center gap-3 px-2 py-2.5 rounded-control hover:bg-surface-2 transition-colors text-left"
              >
                <span className="text-white text-sm font-semibold tabular-nums w-12">{s.time}</span>
                <span className="text-white/64 text-sm flex-1 tabular-nums">{s.isToday ? 'Hôm nay' : s.day}</span>
                <CapacityMarks taken={s.taken} capacity={s.capacity} showLabel labelStyle="remaining" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

const polarityClass = { good: 'text-primary-text', bad: 'text-error-text', neutral: 'text-white/64' } as const;

export function InbodyFigures({ summary, layout = 'row' }: { summary: InbodySummary; layout?: 'row' | 'list' }) {
  return (
    <dl
      className={cn(
        layout === 'row' ? 'grid grid-cols-3 divide-x divide-line' : 'divide-y divide-line',
      )}
    >
      {summary.metrics.map((m) => (
        <div
          key={m.key}
          className={cn(layout === 'row' ? 'px-4 first:pl-0 last:pr-0' : 'flex items-baseline justify-between py-3 first:pt-0 last:pb-0')}
        >
          <dt className="text-white/64 text-[13px] font-medium">{m.label}</dt>
          <dd className={cn(layout === 'row' ? 'mt-1' : 'text-right')}>
            <span className="text-white text-xl font-semibold tabular-nums">{formatVi(m.value)}</span>
            <span className="text-white/64 text-sm ml-1">kg</span>
            {m.delta !== null && (
              <span className={cn('block text-xs mt-0.5 tabular-nums', polarityClass[m.polarity])}>
                {formatSigned(m.delta)} kg
              </span>
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * Weight over time: a 2px straight line in the data green, a dot on the latest
 * point only, three faint gridlines, min/max ticks — DESIGN.md v2 "Charts".
 */
export function WeightTrend({ points, height = 120 }: { points: { date: string; value: number }[]; height?: number }) {
  if (points.length < 2) {
    return (
      <p className="text-white/64 text-sm leading-relaxed">
        Cần ít nhất 2 lần đo để vẽ xu hướng. PT sẽ cập nhật sau buổi đo InBody tiếp theo.
      </p>
    );
  }
  const W = 600;
  const H = height;
  const padY = 10;
  const values = points.map((p) => p.value);
  let min = Math.min(...values);
  let max = Math.max(...values);
  if (max - min < 1) {
    min -= 0.5;
    max += 0.5;
  }
  const x = (i: number) => (i / (points.length - 1)) * W;
  const y = (v: number) => padY + (1 - (v - min) / (max - min)) * (H - padY * 2);
  const d = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(' ');
  const last = points[points.length - 1];

  return (
    <figure className="m-0">
      <div className="flex gap-3">
        <div className="flex flex-col justify-between text-xs text-white/64 tabular-nums py-1 shrink-0 text-right" style={{ height: H }}>
          <span>{formatVi(max)}</span>
          <span>{formatVi(min)}</span>
        </div>
        <div className="relative flex-1 min-w-0" style={{ height: H }}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          className="absolute inset-0 w-full h-full overflow-visible"
          role="img"
          aria-label={`Cân nặng từ ${formatVi(points[0].value)} kg (${points[0].date}) đến ${formatVi(last.value)} kg (${last.date})`}
        >
          {[0, 0.5, 1].map((t) => (
            <line key={t} x1={0} x2={W} y1={padY + t * (H - padY * 2)} y2={padY + t * (H - padY * 2)} stroke="rgba(255,255,255,0.06)" strokeWidth={1} vectorEffect="non-scaling-stroke" />
          ))}
          <path d={d} fill="none" stroke="#3dbe7a" strokeWidth={2} strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        </svg>
        {/* HTML dot: an SVG circle would stretch with preserveAspectRatio="none". */}
        <span
          aria-hidden="true"
          className="absolute w-2.5 h-2.5 -mr-[5px] -mt-[5px] rounded-full bg-primary-text ring-2 ring-surface"
          style={{ right: 0, top: `${(y(last.value) / H) * 100}%` }}
        />
        </div>
      </div>
      <figcaption className="flex justify-between text-xs text-white/64 tabular-nums mt-2 pl-10">
        <span>{points[0].date}</span>
        <span>{last.date}</span>
      </figcaption>
    </figure>
  );
}
