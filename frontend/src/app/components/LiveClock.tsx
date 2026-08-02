import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

function getNow() {
  return new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
}

function pad(n: number) {
  return String(n).padStart(2, '0');
}

const VIET_DAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

export function LiveClock() {
  const [now, setNow] = useState(getNow);

  useEffect(() => {
    // Sync to the next whole second, then tick every second
    const msUntilNextSecond = 1000 - (Date.now() % 1000);
    let id: ReturnType<typeof setInterval>;
    const timeout = setTimeout(() => {
      setNow(getNow());
      id = setInterval(() => setNow(getNow()), 1000);
    }, msUntilNextSecond);
    return () => { clearTimeout(timeout); clearInterval(id); };
  }, []);

  const hh = pad(now.getHours());
  const mm = pad(now.getMinutes());
  const ss = pad(now.getSeconds());
  const day = VIET_DAYS[now.getDay()];
  const date = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()}`;

  return (
    <div className="flex items-center gap-2.5 select-none">
      <div className="flex items-center justify-center w-7 h-7 rounded-full bg-[#0F6B3E]/15 border border-[#0F6B3E]/25">
        <Clock className="w-3.5 h-3.5 text-[#0F6B3E]" />
      </div>
      <div className="flex flex-col items-center leading-none">
        <span className="text-white font-bold text-lg tracking-widest tabular-nums">
          {hh}<span className="animate-pulse text-[#0F6B3E]">:</span>{mm}<span className="text-white/30 text-base font-normal">:{ss}</span>
        </span>
        <span className="text-white/35 text-[11px] tracking-wide mt-0.5">
          {day} · {date} · TP.HCM
        </span>
      </div>
    </div>
  );
}
