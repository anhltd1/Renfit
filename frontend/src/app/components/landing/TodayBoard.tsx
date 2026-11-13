import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from '../Link';
import { fetchAvailability, type Availability } from '../../../lib/api/bookings';
import { CapacityMarks, PLACES_PER_SLOT } from '../../shared/booking/CapacityMarks';
import { dayLabel, gymNow } from '../../shared/member/memberHomeModel';
import { cn } from '../../shared/primitives/cn';

/**
 * TodayBoard — the landing page's one live thing (DESIGN.md v2 "Marketing
 * surface"). The gym's real next open hours, each drawn with its 4 places,
 * read from the public availability endpoint (counts only, no names).
 * Falls back to the plain rule when the API can't be reached.
 */
interface BoardRow {
  key: string;
  time: string;
  taken: number;
  full: boolean;
}

function buildBoard(av: Availability, now: Date, max: number): { day: string; isToday: boolean; rows: BoardRow[] } | null {
  const pad = (n: number) => String(n).padStart(2, '0');
  const todayKey = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  for (const d of av.days) {
    if (d.date < todayKey) continue;
    const rows = d.slots
      .filter((s) => !s.past && !(d.date === todayKey && s.hour <= now.getHours()))
      .slice(0, max)
      .map((s) => ({ key: `${d.date}-${s.hour}`, time: `${pad(s.hour)}:00`, taken: s.count, full: s.full }));
    if (rows.length > 0) return { day: dayLabel(d.date), isToday: d.date === todayKey, rows };
  }
  return null;
}

export function TodayBoard({ ctaTo, rows = 4, className }: { ctaTo: string; rows?: number; className?: string }) {
  const [board, setBoard] = useState<ReturnType<typeof buildBoard>>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'offline'>('loading');

  useEffect(() => {
    let alive = true;
    fetchAvailability('')
      .then((av) => {
        if (!alive) return;
        setBoard(buildBoard(av, gymNow(), rows));
        setState('ready');
      })
      .catch(() => alive && setState('offline'));
    return () => {
      alive = false;
    };
  }, [rows]);

  return (
    <section
      aria-labelledby="today-board-title"
      data-testid="today-board"
      data-ui
      className={cn('border border-line rounded-panel bg-surface', className)}
    >
      <div className="flex items-baseline justify-between gap-3 px-5 pt-4 pb-3">
        <h2 id="today-board-title" className="text-white text-base font-semibold">
          {board ? (board.isToday ? 'Còn chỗ hôm nay' : `Còn chỗ ${board.day}`) : 'Mỗi giờ 4 chỗ'}
        </h2>
        <span className="text-white/64 text-[13px] tabular-nums">
          {state === 'ready' && board ? 'cập nhật trực tiếp' : 'Thứ 2 – Thứ 7 · 08:00 – 21:00'}
        </span>
      </div>

      {state === 'loading' && (
        <div className="px-5 pb-4 space-y-2" aria-busy="true">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-8 rounded-control bg-surface-2 animate-pulse" />
          ))}
        </div>
      )}

      {state !== 'loading' && !board && (
        <p className="px-5 pb-5 text-white/64 text-sm leading-relaxed">
          Mỗi khung giờ chỉ nhận tối đa {PLACES_PER_SLOT} người, nên huấn luyện viên luôn ở ngay bên cạnh bạn. Đăng ký để xem giờ còn chỗ.
        </p>
      )}

      {board && (
        <ul className="border-t border-line divide-y divide-line">
          {board.rows.map((r) => (
            <li key={r.key} className="flex items-center gap-4 px-5 h-11">
              <span className="w-12 text-white text-sm font-semibold tabular-nums">{r.time}</span>
              <CapacityMarks taken={r.taken} />
              <span className={cn('ml-auto text-sm tabular-nums', r.full ? 'text-white/64' : 'text-white/90')}>
                {r.full ? 'Hết chỗ' : `Còn ${PLACES_PER_SLOT - r.taken} chỗ`}
              </span>
            </li>
          ))}
        </ul>
      )}

      <Link
        to={ctaTo}
        className="flex items-center justify-between gap-3 px-5 h-12 border-t border-line text-sm text-white hover:bg-surface-2 rounded-b-panel transition-colors"
      >
        Giữ một chỗ <ArrowRight className="w-4 h-4 text-white/64" aria-hidden="true" />
      </Link>
    </section>
  );
}
