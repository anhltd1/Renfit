import { useEffect, useState } from 'react';

function getNow() {
  return new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
}

function pad(n: number) {
  return String(n).padStart(2, '0');
}

const VIET_DAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

/**
 * Gym-local time (Asia/Ho_Chi_Minh), set as plain type: "14:32 · T2 09/11".
 * DESIGN.md v2: no icon chip, no coloured separator — the time is data, not
 * decoration. Ticks once a minute (aligned to the minute boundary).
 */
export function LiveClock() {
  const [now, setNow] = useState(getNow);

  useEffect(() => {
    const msUntilNextMinute = 60_000 - (Date.now() % 60_000);
    let id: ReturnType<typeof setInterval>;
    const timeout = setTimeout(() => {
      setNow(getNow());
      id = setInterval(() => setNow(getNow()), 60_000);
    }, msUntilNextMinute);
    return () => { clearTimeout(timeout); clearInterval(id); };
  }, []);

  return (
    <p className="select-none text-sm leading-none tabular-nums whitespace-nowrap" aria-label="Giờ tại phòng tập">
      <span className="text-white font-semibold">{pad(now.getHours())}:{pad(now.getMinutes())}</span>
      <span className="text-white/64"> · {VIET_DAYS[now.getDay()]} {pad(now.getDate())}/{pad(now.getMonth() + 1)}</span>
    </p>
  );
}
